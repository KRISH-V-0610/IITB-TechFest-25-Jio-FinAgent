# state.py
from typing import TypedDict, Optional, Literal
from browser_use import Agent

class AgentState(TypedDict):
    user_command: str
    browser: Optional[Agent]

    auth_required: bool
    auth_choice: Optional[Literal["login", "signup", "manual"]]

    logged_in: bool
    awaiting_pin: bool
    task_completed: bool
