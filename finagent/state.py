from typing import TypedDict, Optional

class AgentState(TypedDict):
    user_command: str
    recipient: Optional[str]
    amount: Optional[str]
    
    logged_in: bool
    task_completed: bool
