# # workflow.py
# from langgraph.graph import StateGraph
# from state import AgentState
# from browser_actions import (
#     open_site,
#     wait_until_dashboard,
#     perform_payment_until_pin,
# )

# # -------------------- NODES --------------------

# async def start_node(state: AgentState):
#     return state


# async def open_site_node(state: AgentState):
#     agent = await open_site()
#     state["browser"] = agent
#     return state


# async def auth_gate_node(state: AgentState):
#     """
#     HUMAN decision node.
#     Browser is already open.
#     """
#     print("\n🔐 Authentication required.")
#     print("Choose how to proceed:")
#     print("1️⃣ Login to existing account")
#     print("2️⃣ Create a new account")
#     print("3️⃣ I will log in manually in the browser")

#     choice = input("Enter 1 / 2 / 3: ").strip()

#     if choice == "3":
#         state["auth_mode"] = "manual"
#     else:
#         print("❌ Only manual login is supported for safety.")
#         state["auth_mode"] = "manual"

#     return state


# async def manual_login_node(state: AgentState):
#     """
#     TRUE human-in-the-loop.
#     Agent is silent.
#     Browser stays open.
#     """
#     print("\n🟡 Log in manually in the browser.")
#     print("➡️ Agent will resume automatically after login.")

#     await wait_until_dashboard(state["browser"])
#     state["logged_in"] = True
#     return state


# async def payment_node(state: AgentState):
#     await perform_payment_until_pin(
#         agent=state["browser"],
#         name=state.get("recipient", "Nisarg"),
#         amount=state.get("amount", "5000"),
#     )
#     return state


# async def pin_wait_node(state: AgentState):
#     """
#     FINAL conscious pause.
#     """
#     print("\n🛑 PIN / confirmation screen reached.")
#     print("👉 Enter PIN manually in the browser.")
#     print("👉 After confirmation, press ENTER here.")

#     input()
#     return state


# async def done_node(state: AgentState):
#     print("\n✅ Payment flow completed safely.")
#     return state


# # -------------------- GRAPH --------------------

# def build_graph():
#     graph = StateGraph(AgentState)

#     graph.add_node("start", start_node)
#     graph.add_node("open_site", open_site_node)
#     graph.add_node("auth_gate", auth_gate_node)
#     graph.add_node("manual_login", manual_login_node)
#     graph.add_node("pay", payment_node)
#     graph.add_node("wait_pin", pin_wait_node)
#     graph.add_node("done", done_node)

#     graph.set_entry_point("start")

#     graph.add_edge("start", "open_site")
#     graph.add_edge("open_site", "auth_gate")
#     graph.add_edge("auth_gate", "manual_login")
#     graph.add_edge("manual_login", "pay")
#     graph.add_edge("pay", "wait_pin")
#     graph.add_edge("wait_pin", "done")

#     return graph.compile()

from langgraph.graph import StateGraph, END
from state import AgentState
from browser_actions import open_site, is_logged_in, perform_payment_logic

async def start_node(state: AgentState):
    return state

async def open_site_node(state: AgentState):
    print("\n🌐 Opening Dummy Bank...")
    await open_site()
    return state

async def check_auth_node(state: AgentState):
    print("🔍 Checking login status...")
    logged_in = await is_logged_in()
    if logged_in:
        print("✅ Already logged in.")
        return {"logged_in": True}
    else:
        print("❌ Not logged in.")
        return {"logged_in": False}

from utils import async_input

async def manual_login_node(state: AgentState):
    print("\n🔐 Authentication Required.")
    print("   I have opened the login page.")
    print("   Please log in manually.")
    print("👉 Press ENTER when you are on the Dashboard.")
    await async_input()
    return {"logged_in": True}

async def payment_node(state: AgentState):
    print(f"\n💸 Processing Payment to {state['recipient']} for ₹{state['amount']}...")
    try:
        await perform_payment_logic(state['recipient'], state['amount'])
        return {}
    except Exception as e:
        print(f"⚠️ Error during payment: {e}")
        return {}

async def pin_wait_node(state: AgentState):
    print("\n🛑 Authorization Required.")
    print("   I have suspended the agent at the PIN screen.")
    print("   Please enter your PIN in the browser to confirm.")
    print("👉 Press ENTER after the transaction is complete.")
    await async_input()
    return {"task_completed": True}

async def done_node(state: AgentState):
    print("\n✅ Workflow Completed.")
    return state

def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("start", start_node)
    graph.add_node("open_site", open_site_node)
    graph.add_node("check_auth", check_auth_node)
    graph.add_node("manual_login", manual_login_node)
    graph.add_node("pay", payment_node)
    graph.add_node("pin_wait", pin_wait_node)
    graph.add_node("done", done_node)

    graph.set_entry_point("start")

    graph.add_edge("start", "open_site")
    graph.add_edge("open_site", "check_auth")
    
    # Conditional edge based on auth status
    def route_auth(state):
        if state.get("logged_in"):
            return "pay"
        return "manual_login"

    graph.add_conditional_edges(
        "check_auth",
        route_auth,
        {
            "pay": "pay",
            "manual_login": "manual_login"
        }
    )

    graph.add_edge("manual_login", "pay")
    graph.add_edge("pay", "pin_wait")
    graph.add_edge("pin_wait", "done")
    graph.add_edge("done", END)

    return graph.compile()
