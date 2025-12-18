# # browser_actions.py
# import os
# from dotenv import load_dotenv
# from browser_use import Agent
# from prompt_templates import BASE_RULES, DEFAULT_URL

# load_dotenv()

# if not os.getenv("BROWSER_USE_API_KEY"):
#     raise RuntimeError("BROWSER_USE_API_KEY not set")


# async def open_site() -> Agent:
#     """
#     Opens the banking website and stops.
#     Browser remains OPEN.
#     """
#     agent = Agent(
#         task=f"""
# Open {DEFAULT_URL}.

# RULES:
# - Open the page
# - DO NOT log in
# - DO NOT sign up
# - DO NOT click anything
# - DO NOT call done
# - STOP immediately after page loads
# """
#     )
#     await agent.run()
#     return agent


# async def wait_until_dashboard(agent: Agent):
#     """
#     BLOCKING WAIT (NO LOOP).
#     Agent stays silent until dashboard appears.
#     """
#     agent.task = """
# Observe the current page.

# WAIT until ANY of the following are visible:
# - Greeting like "Hello"
# - Account balance
# - Buttons such as "Pay" or "Send Money"

# When visible:
# - STOP immediately
# - DO NOT click
# - DO NOT type
# - DO NOT call done
# """
#     await agent.run()


# async def perform_payment_until_pin(
#     agent: Agent,
#     name: str,
#     amount: str,
# ):
#     """
#     Performs payment steps but STOPS at PIN.
#     """
#     agent.task = f"""
# {BASE_RULES}

# You are already logged in.

# Steps:
# 1. Click "Pay" or "Send Money"
# 2. Select recipient "{name}"
# 3. Enter amount "{amount}"
# 4. Click proceed
# 5. The MOMENT a PIN / confirmation screen appears:
#    - STOP
#    - DO NOT type
#    - DO NOT click confirm
#    - DO NOT call done
# """
#     await agent.run()


import os
from dotenv import load_dotenv
from browser_use import Agent
from prompt_templates import BASE_RULES, DEFAULT_URL
from browser_manager import browser_manager

load_dotenv()

if not os.getenv("BROWSER_USE_API_KEY"):
    raise RuntimeError("BROWSER_USE_API_KEY not set")

# --- MONKEY PATCH FOR PERSISTENCE ---
try:
    from browser_use.browser.browser import BrowserSession
    async def no_op_reset(self, *args, **kwargs):
        print("🛡️ FinAgent prevented BrowserSession from resetting/closing!")
    BrowserSession.reset = no_op_reset
except ImportError:
    try:
         from browser_use.browser.session import BrowserSession
         async def no_op_reset(self, *args, **kwargs):
             print("🛡️ FinAgent prevented BrowserSession from resetting/closing!")
         BrowserSession.reset = no_op_reset
    except:
        print("⚠️ Failed to patch BrowserSession. Persistence may fail.")
# ------------------------------------

async def open_site():
    """
    Direct Playwright: Opens site in single tab.
    """
    # Simply ensure we have a page and go there.
    # Agent will pick it up later because we neutralized reset.
    page = await browser_manager.ensure_single_page()
    await page.goto(DEFAULT_URL)
    await page.bring_to_front()

async def is_logged_in() -> bool:
    """
    Agentic Check: Uses Agent to check status safely.
    """
    context = await browser_manager.get_persistent_context()
    # Explicitly close blanks before starting
    await browser_manager.ensure_single_page()
    
    agent = Agent(
        task=f"""
STRICT OBSERVATION ONLY.
1. GO TO {DEFAULT_URL}.
2. DO NOT CLICK "Sign Up".
3. DO NOT TYPE anywhere.
4. JUST LOOK at the page.
5. If you see text like "Welcome" or "Balance" or "Dashboard", output "YES" and STOP.
6. ONLY if you strictly see a Login form AND NO "Welcome" message, output "NO".
""",
        browser_context=context
    )
    history = await agent.run()
    
    result = history.final_result()
    return "YES" in str(result)

async def perform_payment_logic(recipient: str, amount: str):
    """
    Agentic Payment: Navigates and Fills.
    STOPS at PIN.
    """
    context = await browser_manager.get_persistent_context()
    await browser_manager.ensure_single_page()
    
    task = f"""
{BASE_RULES}
You are logged in.
1. GO TO "{DEFAULT_URL}/transfer" (or click "Send Money").
2. Type recipient "{recipient}" in the search box.
3. Select the user.
4. Type amount "{amount}".
5. Click Pay/Proceed.
6. STOP IMMEDIATELY if you see "Enter PIN".
7. DO NOT ENTER PIN.
"""
    
    agent = Agent(
        task=task,
        browser_context=context
    )
    await agent.run()
    await browser_manager.ensure_single_page()

