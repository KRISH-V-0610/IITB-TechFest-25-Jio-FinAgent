import asyncio
import os
from dotenv import load_dotenv
from browser_use import Agent
from memory import agent_memory

load_dotenv()

if not os.getenv("BROWSER_USE_API_KEY"):
    raise RuntimeError("BROWSER_USE_API_KEY not found in .env")

def build_task(user_command: str) -> str:
    """
    Builds a safe, isolated task with auto-login if needed.
    """

    login_block = ""
    if not agent_memory["is_logged_in"]:
        login_block = f"""
First, log in to the Dummy Bank:
- Open http://localhost:5173
- Enter username: {agent_memory['username']}
- Enter password: {agent_memory['password']}
- Submit login form
- Confirm login success
"""

    return f"""
You are a browser automation agent working on a banking website.

IMPORTANT RULES:
- Execute the steps carefully and sequentially
- Do NOT assume login unless completed
- Stop before any payment and WAIT if required
- Complete the task fully before finishing

{login_block}

Now perform the user request:
{user_command}
"""

async def run_agent_task(task: str):
    agent = Agent(
        task=task
    )
    await agent.run()

async def main():
    print("\nFinAgent – Safe Stateless Mode")
    print("Each command runs in a fresh, isolated browser session.")
    print("Type 'exit' to stop.\n")

    while True:
        user_command = input("> ")

        if user_command.lower() in ["exit", "quit"]:
            print("Exiting FinAgent.")
            break

        task = build_task(user_command)

        await run_agent_task(task)

        # 🔐 Update memory AFTER successful run
        agent_memory["is_logged_in"] = True
        agent_memory["last_action"] = user_command

if __name__ == "__main__":
    asyncio.run(main())
