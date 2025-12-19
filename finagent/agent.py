"""
agent.py — Browser-Use + FastAPI (WebSocket) HiTL Agent Server
"""

import asyncio
import logging
from typing import Tuple, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from browser_use import Agent, Browser
from browser_use.llm import ChatBrowserUse

load_dotenv()


# ---------------- CONFIG ----------------
HEADLESS = True

# ---------------- GLOBALS ----------------
ACTIVE_CONNECTION: Optional[WebSocket] = None
PAUSED_EVENT = asyncio.Event()
PAUSED_EVENT.set()  # not paused by default
CURRENT_TASK: Optional[asyncio.Task] = None
CURRENT_AGENT: Optional[Agent] = None # For streaming access


# ---------------- HITL HELPERS ----------------
def looks_sensitive(url: str, page_html: str) -> Tuple[bool, str]:
    """
    Heuristic detection for sensitive flows.
    """
    u = (url or "").lower()
    h = (page_html or "").lower()

    # Password
    if 'type="password"' in h or ("autocomplete" in h and "current-password" in h):
        return True, "PASSWORD_ENTRY"
    if "one-time-code" in h or "enter otp" in h or " otp" in h:
        return True, "OTP_ENTRY"
    if "cvv" in h or "upi pin" in h or "card number" in h:
        return True, "PAYMENT_DETAILS"
    if any(k in u for k in ["checkout", "payment", "billing", "confirm"]):
        return True, "PAYMENT_FLOW"
    if any(k in h for k in ["place order", "confirm payment", "buy now", "checkout"]):
        return True, "PAYMENT_CONFIRM"

    return False, ""


async def safe_send(text: str):
    try:
        if ACTIVE_CONNECTION:
            await ACTIVE_CONNECTION.send_text(text)
    except Exception as e:
        print(f"WS_SEND_ERROR: {e}")


async def get_page_html(agent: Agent) -> str:
    try:
        page = await agent.browser_session.must_get_current_page()
        return await page.content()
    except Exception:
        return ""


async def on_step_start(agent: Agent):
    try:
        # Manual pause gate
        await PAUSED_EVENT.wait()

        state = await agent.browser_session.get_browser_state_summary()
        url = getattr(state, "url", "") or ""
        html = await get_page_html(agent)

        is_sensitive, reason = looks_sensitive(url, html)
        if is_sensitive:
            PAUSED_EVENT.clear()
            await safe_send(f"⚠️ SECURITY PAUSE: {reason} detected at {url}")
            await safe_send("HITL_STATUS:PAUSED")
            await safe_send("Send: RESUME to continue, or STOP to cancel this run.")
            await PAUSED_EVENT.wait()

    except asyncio.CancelledError:
        raise
    except Exception as e:
        await safe_send(f"HiTL Hook Error: {e}")


# ---------------- STREAMING ----------------
async def stream_browser_view():
    """
    Background task: continuously captures screenshots from CURRENT_AGENT
    and broadcasts them to the dashboard.
    """
    import base64
    import os
    print("🎥 Stream Task Started (Clean Mode)...")
    while True:
        try:
            if ACTIVE_CONNECTION and CURRENT_AGENT:
                 session = getattr(CURRENT_AGENT, 'browser_session', None)
                 # Only stream if session exists AND not closing
                 if session:
                    try:
                        # Check if closed first (hacky, but reduces errors)
                        # Actually just try/except specific errors
                        page = await session.get_current_page()
                        if page:
                            screenshot = await page.screenshot(format="jpeg", quality=40)
                            
                            b64_data = ""
                            if isinstance(screenshot, bytes):
                                b64_data = base64.b64encode(screenshot).decode('utf-8')
                            elif isinstance(screenshot, str):
                                if os.path.exists(screenshot):
                                    with open(screenshot, "rb") as f:
                                        file_bytes = f.read()
                                    b64_data = base64.b64encode(file_bytes).decode('utf-8')
                                else:
                                    b64_data = screenshot
                            
                            if b64_data:
                                await safe_send(f"BROADCAST_IMAGE:{b64_data}")
                                # print("DEBUG: Frame sent!") 
                            else:
                                print("DEBUG: Screenshot empty")
                        else:
                             print("DEBUG: No page found yet")

                    except Exception as e:
                        # Suppress connection closed errors which happen during shutdown
                        msg = str(e)
                        if "Connection closed" in msg or "Client is stopping" in msg:
                            pass
                        else:
                            print(f"DEBUG: Stream Error: {e}") # Print other errors
            else:
                 pass # print("DEBUG: Waiting for agent...")
            
            await asyncio.sleep(0.2) 
            
        except asyncio.CancelledError:
            print("Stream: Cancelled")
            break
        except Exception as e:
            print(f"Stream Loop Crash: {e}")
            await asyncio.sleep(1)



# ---------------- FASTAPI LIFECYCLE ----------------
GLOBAL_BROWSER: Optional[Browser] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global CURRENT_AGENT
    print("🚀 Starting FinAgent Server...")
    
    # 2. Start Streamer
    stream_task = asyncio.create_task(stream_browser_view())
    
    yield
    
    print("👋 Shutting down...")
    
    # Cleanup
    stream_task.cancel()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOGGING TO WS ----------------
class WebSocketHandler(logging.Handler):
    def emit(self, record):
        msg = self.format(record)
        asyncio.create_task(safe_send(msg))


logger = logging.getLogger("finagent")
logger.setLevel(logging.INFO)

ws_handler = WebSocketHandler()
ws_handler.setFormatter(logging.Formatter("SYSTEM: %(message)s"))
logger.addHandler(ws_handler)
logging.getLogger("browser_use").addHandler(ws_handler)
logging.getLogger("uvicorn").setLevel(logging.WARNING)


# ---------------- AGENT RUNNER ----------------
    
async def run_agent_task(task_text: str):
    global CURRENT_AGENT
    
    # Reverting to Per-Task Browser to ensure reliability
    # Global Browser approach caused Session Reset issues with browser-use library
    browser = Browser(headless=HEADLESS)
    
    try:
        await safe_send(f"🤖 Starting task: {task_text}")
        await safe_send("HITL_STATUS:RUNNING")
        await safe_send("STREAM:START") 

        llm = ChatBrowserUse()
        
        # Strategy: Fresh Browser per task.
        # Browser (BrowserSession) in this version manages its own context.
        # We just pass it to the Agent.
        
        agent = Agent(
            task=task_text,
            llm=llm,
            browser=browser,
        )
        
        CURRENT_AGENT = agent 

        await agent.run(on_step_start=on_step_start)

        await safe_send("✅ Task Completed")

    except asyncio.CancelledError:
        await safe_send("🛑 Task cancelled.")
        raise
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"CRITICAL AGENT ERROR: {trace}")
        await safe_send(f"❌ Error: {e}")
    finally:
        CURRENT_AGENT = None 
        await safe_send("HITL_STATUS:IDLE")
        await safe_send("STREAM:STOP") 
        
        # BrowserSession (browser) usually cleans itself up when Agent stops
        # But we can try to ensure it's closed
        try:
             if hasattr(browser, 'close'):
                 await browser.close()
        except:
            pass



# ---------------- WEBSOCKET API ----------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global ACTIVE_CONNECTION, CURRENT_TASK

    await websocket.accept()
    ACTIVE_CONNECTION = websocket

    await websocket.send_text("✅ Connected to FinAgent")
    
    try:
        while True:
            msg = (await websocket.receive_text()).strip()

            if msg.upper() == "PAUSE":
                PAUSED_EVENT.clear()
                await websocket.send_text("HITL_STATUS:PAUSED")
                continue

            if msg.upper() == "RESUME":
                PAUSED_EVENT.set()
                await websocket.send_text("HITL_STATUS:RUNNING")
                continue

            if msg.upper() == "STOP":
                PAUSED_EVENT.set()
                if CURRENT_TASK and not CURRENT_TASK.done():
                    CURRENT_TASK.cancel()
                    await websocket.send_text("🛑 Cancelling task...")
                else:
                    await websocket.send_text("🛑 No running task.")
                continue

            # Start Run
            # Treat legacy messages as RUN commands if not special keywords
            cmd = msg
            if cmd.upper().startswith("RUN:"):
                 cmd = cmd[4:].strip()
            
            task_text = cmd
            # print(f"DEBUG: Received Run request: {task_text}")
            
            if not task_text:
                continue

            if CURRENT_TASK and not CURRENT_TASK.done():
                await websocket.send_text("⚠️ A task is already running. Send STOP first.")
                continue

            PAUSED_EVENT.set()
            CURRENT_TASK = asyncio.create_task(run_agent_task(task_text))
            
    except WebSocketDisconnect:
        ACTIVE_CONNECTION = None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
