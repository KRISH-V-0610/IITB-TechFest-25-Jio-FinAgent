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


# browser_actions.py
import os
from dotenv import load_dotenv
from browser_use import Agent
from prompt_templates import BASE_RULES, DEFAULT_URL

load_dotenv()

if not os.getenv("BROWSER_USE_API_KEY"):
    raise RuntimeError("BROWSER_USE_API_KEY not set")


async def open_site_only():
    """
    PHASE 1
    Opens site and ENDS.
    Human logs in manually.
    """
    agent = Agent(
        task=f"""
Open {DEFAULT_URL}.

Rules:
- ONLY open the page
- Do NOT log in
- Do NOT sign up
- End immediately
"""
    )
    await agent.run()


async def wait_for_dashboard_and_pay(name: str, amount: str):
    """
    PHASE 2
    Assumes user already logged in.
    """
    agent = Agent(
        task=f"""
{BASE_RULES}

You are already logged in.

Steps:
1. Confirm dashboard is visible (Hello / Balance / Pay)
2. Click Pay / Send Money
3. Select recipient "{name}"
4. Enter amount "{amount}"
5. Proceed UNTIL PIN screen
6. STOP immediately when PIN appears
"""
    )
    await agent.run()
