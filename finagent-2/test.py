# import asyncio
# import base64
# from pathlib import Path
# from typing import Tuple

# from dotenv import load_dotenv
# from fastapi import FastAPI
# from fastapi.responses import HTMLResponse, Response, JSONResponse
# import uvicorn

# from browser_use import Browser, ChatBrowserUse
# from browser_use.agent.service import Agent
# from browser_use.browser.events import ScreenshotEvent

# load_dotenv()

# # =========================
# # HiTL shared state
# # =========================
# resume_event = asyncio.Event()

# hitl_state = {
#     "paused": False,
#     "reason": "",
#     "url": "",
#     "last_screenshot_bytes": b"",
#     "last_html_hint": "",
# }

# # =========================
# # Sensitive detectors
# # =========================
# def looks_sensitive(url: str, page_html: str) -> Tuple[bool, str]:
#     u = (url or "").lower()
#     h = (page_html or "").lower()

#     # Password / OTP / PIN / CVV
#     if 'type="password"' in h or ("autocomplete" in h and "current-password" in h):
#         return True, "PASSWORD_ENTRY"
#     if "one-time-code" in h or "enter otp" in h or " otp" in h:
#         return True, "OTP_ENTRY"
#     if "cvv" in h or "upi pin" in h or "card number" in h:
#         return True, "PAYMENT_DETAILS"

#     # Checkout / Payment flow / confirmation
#     if any(k in u for k in ["checkout", "payment", "billing", "confirm"]):
#         return True, "PAYMENT_FLOW"
#     if any(k in h for k in ["pay", "place order", "confirm payment", "buy now", "checkout"]):
#         return True, "PAYMENT_CONFIRM"

#     return False, ""

# # =========================
# # Browser helpers
# # =========================
# async def get_page_html(agent: Agent) -> str:
#     cdp = await agent.browser_session.get_or_create_cdp_session()
#     doc = await cdp.cdp_client.send.DOM.getDocument(session_id=cdp.session_id)
#     html_result = await cdp.cdp_client.send.DOM.getOuterHTML(
#         params={"nodeId": doc["root"]["nodeId"]},
#         session_id=cdp.session_id,
#     )
#     return html_result.get("outerHTML", "")

# async def take_screenshot_bytes(agent: Agent) -> bytes:
#     ev = agent.browser_session.event_bus.dispatch(ScreenshotEvent(full_page=False))
#     await ev
#     result = await ev.event_result(raise_if_any=True, raise_if_none=True)

#     # In many setups, this is a filepath string; sometimes base64.
#     if isinstance(result, str):
#         p = Path(result)
#         if p.exists() and p.is_file():
#             return p.read_bytes()

#         try:
#             return base64.b64decode(result, validate=True)
#         except Exception:
#             return b""

#     return b""

# # =========================
# # On-screen Resume overlay
# # =========================
# async def inject_resume_overlay(agent: Agent, reason: str, server_base: str = "http://127.0.0.1:8000"):
#     page = await agent.browser_session.must_get_current_page()

#     await page.evaluate(
#         """({ reason, serverBase }) => {
#             const id = "__hitl_resume_overlay__";
#             const old = document.getElementById(id);
#             if (old) old.remove();

#             const wrap = document.createElement("div");
#             wrap.id = id;
#             wrap.style.position = "fixed";
#             wrap.style.zIndex = "2147483647";
#             wrap.style.top = "16px";
#             wrap.style.right = "16px";
#             wrap.style.width = "360px";
#             wrap.style.background = "rgba(0,0,0,0.88)";
#             wrap.style.color = "white";
#             wrap.style.padding = "14px";
#             wrap.style.borderRadius = "14px";
#             wrap.style.boxShadow = "0 10px 30px rgba(0,0,0,0.45)";
#             wrap.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
#             wrap.style.userSelect = "none";

#             wrap.innerHTML = `
#               <div style="font-size:14px;opacity:0.9;margin-bottom:6px;">Human approval required</div>
#               <div style="font-size:18px;font-weight:800;margin-bottom:10px;">${reason}</div>
#               <button id="__hitl_resume_btn__"
#                 style="
#                   width:100%;
#                   padding:12px 14px;
#                   border-radius:12px;
#                   border:0;
#                   cursor:pointer;
#                   font-size:16px;
#                   font-weight:800;
#                 ">
#                 ▶ Resume Agent
#               </button>
#               <div id="__hitl_resume_msg__" style="margin-top:10px;font-size:12px;opacity:0.85;">
#                 Complete the sensitive step manually, then press Resume.
#               </div>
#               <div style="margin-top:10px;font-size:11px;opacity:0.7;">
#                 If Resume fails, open: ${serverBase}
#               </div>
#             `;

#             document.body.appendChild(wrap);

#             const btn = document.getElementById("__hitl_resume_btn__");
#             const msg = document.getElementById("__hitl_resume_msg__");

#             btn.onclick = async () => {
#               btn.disabled = true;
#               msg.textContent = "Resuming...";
#               try {
#                 const r = await fetch(serverBase + "/hitl/resume", { method: "POST" });
#                 if (!r.ok) throw new Error("HTTP " + r.status);
#                 msg.textContent = "Resume signal sent ✅";
#               } catch (e) {
#                 btn.disabled = false;
#                 msg.textContent = "Failed to reach local server ❌ (is FastAPI running?)";
#               }
#             };
#         }""",
#         {"reason": reason, "serverBase": server_base},
#     )

# async def remove_resume_overlay(agent: Agent):
#     page = await agent.browser_session.must_get_current_page()
#     await page.evaluate(
#         """() => {
#             const old = document.getElementById("__hitl_resume_overlay__");
#             if (old) old.remove();
#         }"""
#     )

# # =========================
# # Browser-Use hook (HiTL gate)
# # =========================
# async def on_step_start(agent: Agent):
#     # Inspect current page
#     state = await agent.browser_session.get_browser_state_summary()
#     url = getattr(state, "url", "") or ""

#     page_html = await get_page_html(agent)
#     sensitive, reason = looks_sensitive(url, page_html)
#     if not sensitive:
#         return

#     # Update dashboard state
#     hitl_state["paused"] = True
#     hitl_state["reason"] = reason
#     hitl_state["url"] = url
#     hitl_state["last_html_hint"] = page_html[:4000]
#     hitl_state["last_screenshot_bytes"] = await take_screenshot_bytes(agent)

#     # Inject on-screen resume UI
#     await inject_resume_overlay(agent, reason)

#     # Pause agent until human resumes
#     agent.pause()

#     await resume_event.wait()
#     resume_event.clear()

#     # Remove overlay and continue
#     await remove_resume_overlay(agent)

#     hitl_state["paused"] = False
#     agent.resume()

# # =========================
# # FastAPI Dashboard
# # =========================
# app = FastAPI()

# @app.get("/", response_class=HTMLResponse)
# def home():
#     return """
# <!doctype html>
# <html>
# <head>
#   <meta charset="utf-8" />
#   <title>Browser-Use HiTL Demo</title>
#   <style>
#     body { font-family: system-ui, Arial; margin: 20px; }
#     .row { display: flex; gap: 16px; align-items: flex-start; }
#     .card { border: 1px solid #ddd; border-radius: 12px; padding: 12px; width: 520px; }
#     button { padding: 10px 14px; border-radius: 10px; border: 1px solid #333; cursor: pointer; }
#     .paused { color: #b00020; font-weight: 800; }
#     .ok { color: #0b7; font-weight: 800; }
#     img { width: 100%; border-radius: 10px; border: 1px solid #eee; }
#     code { background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }
#   </style>
# </head>
# <body>
#   <h2>Human-in-the-Loop (Password / Payment Gate)</h2>
#   <div class="row">
#     <div class="card">
#       <div id="status"></div>
#       <p><b>Reason:</b> <span id="reason">-</span></p>
#       <p><b>URL:</b> <span id="url">-</span></p>
#       <button onclick="resumeAgent()">Resume Agent</button>
#       <button onclick="abortRun()" style="margin-left:8px;">Abort</button>
#       <p style="margin-top:14px;">
#         You can resume either from here or using the on-screen overlay button inside the website.
#       </p>
#     </div>
#     <div class="card">
#       <p><b>Latest Screenshot (captured at pause)</b></p>
#       <img id="shot" src="/hitl/screenshot?ts=0" />
#     </div>
#   </div>

# <script>
# async function poll(){
#   const r = await fetch("/hitl/status");
#   const j = await r.json();
#   document.getElementById("reason").textContent = j.reason || "-";
#   document.getElementById("url").textContent = j.url || "-";
#   document.getElementById("status").innerHTML =
#     j.paused ? '<span class="paused">PAUSED (Human required)</span>' : '<span class="ok">RUNNING</span>';
#   if(j.paused){
#     document.getElementById("shot").src = "/hitl/screenshot?ts=" + Date.now();
#   }
# }
# async function resumeAgent(){
#   await fetch("/hitl/resume", {method:"POST"});
#   await poll();
# }
# async function abortRun(){
#   await fetch("/hitl/abort", {method:"POST"});
#   await poll();
# }
# setInterval(poll, 1000);
# poll();
# </script>
# </body>
# </html>
# """

# @app.get("/hitl/status")
# def status():
#     return JSONResponse({
#         "paused": hitl_state["paused"],
#         "reason": hitl_state["reason"],
#         "url": hitl_state["url"],
#     })

# @app.get("/hitl/screenshot")
# def screenshot():
#     b = hitl_state["last_screenshot_bytes"] or b""
#     if not b:
#         return Response(status_code=204)
#     return Response(content=b, media_type="image/png")

# @app.post("/hitl/resume")
# def resume():
#     resume_event.set()
#     return {"ok": True}

# @app.post("/hitl/abort")
# def abort():
#     hitl_state["paused"] = False
#     hitl_state["reason"] = "ABORT_REQUESTED"
#     resume_event.set()
#     return {"ok": True}

# # =========================
# # Run server + agent together
# # =========================
# async def run_agent():
#     url = "http://localhost:5173/login"

#     # Start browser (headless=False so you can manually type password)
#     browser = Browser(headless=False)
#     await browser.start()

#     # Manually open URL (bypasses missing 'navigate' action)
#     page = await browser.must_get_current_page()
#     await page.goto(url)

#     llm = ChatBrowserUse()

#     # ✅ Task contains NO URL and NO stopping hints
#     task = "Pay to vansh 500 INR using UPI."

#     agent = Agent(
#         task=task,
#         browser=browser,
#         llm=llm,
#         directly_open_url=False,  # keep off even if task accidentally contains URL later
#     )

#     await agent.run(on_step_start=on_step_start, max_steps=25)

# async def run_server():
#     config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="info")
#     server = uvicorn.Server(config)
#     await server.serve()

# async def main():
#     await asyncio.gather(run_server(), run_agent())

# if __name__ == "__main__":
#     asyncio.run(main())


import asyncio
import base64
from pathlib import Path
from typing import Tuple

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, Response, JSONResponse
import uvicorn

from browser_use import Browser, ChatBrowserUse
from browser_use.agent.service import Agent
from browser_use.browser.events import ScreenshotEvent

load_dotenv()

# =========================
# HiTL shared state
# =========================
resume_event = asyncio.Event()

hitl_state = {
    "paused": False,
    "reason": "",
    "url": "",
    "last_screenshot_bytes": b"",
    "last_html_hint": "",
}

# Prevent infinite pause loops
last_pause_signature = None

# =========================
# STRICT Sensitive detectors
# =========================
def looks_sensitive(url: str, page_html: str) -> Tuple[bool, str, str]:
    """
    Returns:
      (is_sensitive, reason, signature_key)
    """
    h = (page_html or "").lower()

    # Password fields
    if 'type="password"' in h:
        return True, "PASSWORD_ENTRY", "password"

    # OTP fields
    if "one-time-code" in h or "enter otp" in h:
        return True, "OTP_ENTRY", "otp"

    # UPI PIN / CVV
    if "upi pin" in h or "cvv" in h:
        return True, "PAYMENT_SECRET", "pin"

    # FINAL irreversible actions only
    if "confirm payment" in h or "pay now" in h or "place order" in h:
        return True, "PAYMENT_CONFIRM", "confirm"

    return False, "", ""

# =========================
# Browser helpers
# =========================
async def get_page_html(agent: Agent) -> str:
    cdp = await agent.browser_session.get_or_create_cdp_session()
    doc = await cdp.cdp_client.send.DOM.getDocument(session_id=cdp.session_id)
    html_result = await cdp.cdp_client.send.DOM.getOuterHTML(
        params={"nodeId": doc["root"]["nodeId"]},
        session_id=cdp.session_id,
    )
    return html_result.get("outerHTML", "")

async def take_screenshot_bytes(agent: Agent) -> bytes:
    ev = agent.browser_session.event_bus.dispatch(ScreenshotEvent(full_page=False))
    await ev
    result = await ev.event_result(raise_if_any=True, raise_if_none=True)

    if isinstance(result, str):
        p = Path(result)
        if p.exists():
            return p.read_bytes()
        try:
            return base64.b64decode(result, validate=True)
        except Exception:
            return b""

    return b""

# =========================
# On-screen Resume overlay
# =========================
async def inject_resume_overlay(agent: Agent, reason: str, server_base: str = "http://127.0.0.1:8000"):
    page = await agent.browser_session.must_get_current_page()

    await page.evaluate(
        """({ reason, serverBase }) => {
            const id = "__hitl_resume_overlay__";
            document.getElementById(id)?.remove();

            const wrap = document.createElement("div");
            wrap.id = id;
            wrap.style.position = "fixed";
            wrap.style.zIndex = "2147483647";
            wrap.style.top = "16px";
            wrap.style.right = "16px";
            wrap.style.width = "360px";
            wrap.style.background = "rgba(0,0,0,0.88)";
            wrap.style.color = "white";
            wrap.style.padding = "14px";
            wrap.style.borderRadius = "14px";
            wrap.style.fontFamily = "system-ui";

            wrap.innerHTML = `
              <div style="font-size:14px;">Human approval required</div>
              <div style="font-size:18px;font-weight:800;margin:8px 0;">${reason}</div>
              <button id="__hitl_resume_btn__" style="width:100%;padding:12px;font-weight:800;">
                ▶ Resume Agent
              </button>
            `;

            document.body.appendChild(wrap);

            document.getElementById("__hitl_resume_btn__").onclick = async () => {
              await fetch(serverBase + "/hitl/resume", { method: "POST" });
            };
        }""",
        {"reason": reason, "serverBase": server_base},
    )

async def remove_resume_overlay(agent: Agent):
    page = await agent.browser_session.must_get_current_page()
    await page.evaluate(
        """() => document.getElementById("__hitl_resume_overlay__")?.remove()"""
    )

# =========================
# Browser-Use hook (FIXED)
# =========================
async def on_step_start(agent: Agent):
    global last_pause_signature

    state = await agent.browser_session.get_browser_state_summary()
    url = getattr(state, "url", "") or ""

    page_html = await get_page_html(agent)
    sensitive, reason, sig = looks_sensitive(url, page_html)

    if not sensitive:
        return

    signature = f"{url}:{sig}"
    if signature == last_pause_signature:
        return  # already approved

    last_pause_signature = signature

    hitl_state.update({
        "paused": True,
        "reason": reason,
        "url": url,
        "last_html_hint": page_html[:4000],
    })

    hitl_state["last_screenshot_bytes"] = await take_screenshot_bytes(agent)

    await inject_resume_overlay(agent, reason)

    agent.pause()
    await resume_event.wait()
    resume_event.clear()

    await remove_resume_overlay(agent)

    hitl_state["paused"] = False
    agent.resume()

# =========================
# FastAPI Dashboard
# =========================
app = FastAPI()

@app.get("/", response_class=HTMLResponse)
def home():
    return """
<!doctype html>
<html>
<body>
<h2>Human-in-the-Loop Dashboard</h2>
<p>Status: <span id="s"></span></p>
<p>Reason: <span id="r"></span></p>
<p>URL: <span id="u"></span></p>
<button onclick="resume()">Resume</button>
<img id="img" width="420"/>
<script>
async function poll(){
  const j = await (await fetch("/hitl/status")).json();
  s.innerText = j.paused ? "PAUSED" : "RUNNING";
  r.innerText = j.reason || "-";
  u.innerText = j.url || "-";
  if(j.paused) img.src="/hitl/screenshot?"+Date.now();
}
async function resume(){
  await fetch("/hitl/resume",{method:"POST"});
}
setInterval(poll,1000); poll();
</script>
</body>
</html>
"""

@app.get("/hitl/status")
def status():
    return hitl_state

@app.get("/hitl/screenshot")
def screenshot():
    if not hitl_state["last_screenshot_bytes"]:
        return Response(status_code=204)
    return Response(hitl_state["last_screenshot_bytes"], media_type="image/png")

@app.post("/hitl/resume")
def resume():
    resume_event.set()
    return {"ok": True}

# =========================
# Run server + agent together
# =========================
async def run_agent():
    browser = Browser(headless=False)
    await browser.start()

    page = await browser.must_get_current_page()
    await page.goto("http://localhost:3001/login")

    agent = Agent(
        task="Pay to vansh 500 INR using UPI.",
        browser=browser,
        llm=ChatBrowserUse(),
        directly_open_url=False,
    )

    await agent.run(on_step_start=on_step_start, max_steps=25)

async def run_server():
    await uvicorn.Server(
        uvicorn.Config(app, host="127.0.0.1", port=8000)
    ).serve()

async def main():
    await asyncio.gather(run_server(), run_agent())

if __name__ == "__main__":
    asyncio.run(main())
