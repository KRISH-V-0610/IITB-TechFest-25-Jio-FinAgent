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

# workflow.py
from langgraph.graph import StateGraph
from state import AgentState
from browser_actions import open_site_only, wait_for_dashboard_and_pay


async def start_node(state: AgentState):
    return state


async def open_site_node(state: AgentState):
    print("\n🌐 Opening Dummy Bank website...")
    await open_site_only()
    return state


async def manual_login_node(state: AgentState):
    print("\n🔐 Please log in MANUALLY in the browser.")
    print("👉 After login, press ENTER here.")
    input()
    return state


async def payment_node(state: AgentState):
    print("\n💸 Initiating payment flow...")
    await wait_for_dashboard_and_pay(
        name=state["recipient"],
        amount=state["amount"]
    )
    return state


async def pin_node(state: AgentState):
    print("\n🛑 PIN screen reached.")
    print("👉 Enter PIN manually in browser.")
    print("👉 Press ENTER here after confirmation.")
    input()
    return state


async def done_node(state: AgentState):
    print("\n✅ Payment flow completed safely.")
    return state


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("start", start_node)
    graph.add_node("open_site", open_site_node)
    graph.add_node("login", manual_login_node)
    graph.add_node("pay", payment_node)
    graph.add_node("pin", pin_node)
    graph.add_node("done", done_node)

    graph.set_entry_point("start")

    graph.add_edge("start", "open_site")
    graph.add_edge("open_site", "login")
    graph.add_edge("login", "pay")
    graph.add_edge("pay", "pin")
    graph.add_edge("pin", "done")

    return graph.compile()
