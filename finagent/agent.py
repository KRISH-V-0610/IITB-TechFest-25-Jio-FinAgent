# # agent.py

# import asyncio
# import os
# import re
# from dotenv import load_dotenv
# from browser_use import Agent
# from memory import agent_memory
# from prompt_templates import build_task

# DEFAULT_URL = "http://localhost:5173"

# def extract_url(text: str):
#     url_pattern = r"https?://[^\s]+"
#     match = re.search(url_pattern, text)
#     return match.group(0) if match else None


# async def run_agent(task: str):
#     """
#     Runs the browser agent once.
#     Does NOT close browser on conscious pause.
#     """
#     agent = Agent(task=task)

#     try:
#         await agent.run()
#     except KeyboardInterrupt:
#         # This is expected in HITL flows
#         print("🟡 Agent interrupted for human action.")


# async def main():
#     load_dotenv()

#     if not os.getenv("BROWSER_USE_API_KEY"):
#         raise RuntimeError("BROWSER_USE_API_KEY missing")

#     print("\nFinAgent – Human-in-the-Loop Mode")
#     print(f"Default site: {DEFAULT_URL}")
#     print("Type 'exit' to quit.\n")

#     while True:
#         user_command = input("> ").strip()

#         if user_command.lower() in ["exit", "quit"]:
#             print("Exiting FinAgent.")
#             break

#         explicit_url = extract_url(user_command)

#         # Enforce default URL unless explicitly overridden
#         if not explicit_url:
#             user_command = f"""
# Open {DEFAULT_URL}.
# Then perform the following task:
# {user_command}
# """

#         task = build_task(user_command)

#         # Run agent
#         await run_agent(task)

#         # Human-in-the-loop pause
#         print("\n🟡 Agent is waiting for human input.")
#         print("👉 Complete any required manual steps in the browser.")
#         print("👉 Type 'continue' to resume or 'exit' to stop.\n")

#         while True:
#             human_cmd = input("(human-in-loop)> ").strip().lower()

#             if human_cmd == "continue":
#                 print("🔄 Resuming agent...\n")
#                 break

#             if human_cmd in ["exit", "quit"]:
#                 print("Exiting FinAgent safely.")
#                 return

#         agent_memory["last_action"] = user_command


# if __name__ == "__main__":
#     asyncio.run(main())

# agent.py
import os
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("BROWSER_USE_API_KEY"):
    raise RuntimeError("BROWSER_USE_API_KEY not found. Check .env file.")

# agent.py
import asyncio
from workflow import build_graph
from state import AgentState

async def main():
    print("\n🤖 FinAgent — Human-in-the-Loop Mode")
    print("Agent will NEVER act at auth or PIN without consent.\n")

    user_command = input("> ")

    state: AgentState = {
        "user_command": user_command,
        "browser": None,
        "auth_required": False,
        "auth_choice": None,
        "logged_in": False,
        "awaiting_pin": False,
        "task_completed": False,
    }

    graph = build_graph()
    await graph.ainvoke(state)

if __name__ == "__main__":
    asyncio.run(main())
