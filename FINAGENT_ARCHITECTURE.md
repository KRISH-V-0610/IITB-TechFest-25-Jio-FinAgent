# FinAgent Application Architecture

## 1. System Overview

**FinAgent** is an autonomous AI agent system designed to perform web-based financial tasks (like banking, navigating portals, etc.) securely and reliably. It uses a **Human-in-the-Loop (HiTL)** design to ensure safety during sensitive operations (like entering passwords).

The system consists of three main parts:
1.  **Command Center (Frontend)**: A modern React dashboard for controlling the agent and viewing the live feed.
2.  **Agent Server (Backend)**: A Python FastAPI server that runs the AI Agent (`Browser-Use`), manages the browser (`Playwright`), and handles WebSocket communication.
3.  **Target Websites**: The actual websites the agent interacts with (e.g., Banking Portal, YouTube, Google).

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    Client[User / Command Center] <-->|WebSocket (JSON/Text)| Server[FastAPI Agent Server]
    
    subgraph "Backend (Agent Server)"
        Server <-->|Control| AgentCore[Browser-Use Agent]
        Server <-->|Stream Images| Streamer[Background Stream Task]
        AgentCore <-->|Context/Page| Browser[Playwright Engine]
        AgentCore <-->|Inference| LLM[Browser-Use Cloud LLM]
    end

    subgraph "Target"
        Browser -->|Interacts| Website[Target Website e.g. YouTube]
    end
```

---

## 3. Component Breakdown

### A. Frontend: Command Center (`/Command-Center-Website`)
*   **Tech Stack**: React, Vite, TailwindCSS v4, Lucide Icons.
*   **Role**:
    *   **Input**: Takes natural language commands (e.g., "Open YouTube").
    *   **Visualization**: Displays a **Live Video Stream** (JPEG sequence) of the agent's browser.
    *   **Logs**: Shows real-time activity and debugging logs.
    *   **HiTL Controls**: Allows the user to `PAUSE`, `RESUME`, or `STOP` the agent manually.
*   **Communication**: Connects to `ws://localhost:8000/ws`.

### B. Backend: Agent Server (`/finagent/agent.py`)
*   **Tech Stack**: Python, FastAPI, Uvicorn, Browser-Use, Playwright.
*   **Role**:
    *   **WebSocket Handler**: Receives commands and broadcasts updates.
    *   **Agent Runner**: Orchestrates the AI planning loop (Observation -> Thought -> Action).
    *   **Streamer**: A background asynchronous task (`stream_browser_view`) that takes screenshots 5 times/second and sends them to the frontend.
    *   **Security (HiTL)**: Analyzes every page load (`looks_sensitive`). If a password/payment field is detected, it auto-pauses and asks for user permission.

---

## 4. The Workflow: "Life of a Request"

Here is exactly what happens when you type **"Open YouTube and search for Python"** and hit Enter.

### Step 1: User Input
*   **User**: Types "Open YouTube and search for Python" in the React App.
*   **Frontend**: Sends WebSocket message: `RUN: Open YouTube and search for Python`.
*   **UI Status**: Changes from **IDLE** to **Processing**.

### Step 2: Server Processing
*   **Server**: Receives `RUN:...`.
*   **Validation**: Checks if an agent is already running. If not, it starts a new generic `run_agent_task`.
*   **Initialization**:
    1.  Starts a **Fresh Browser** instance (Headless Chrome).
    2.  Initializes the **LLM** (`ChatBrowserUse`).
    3.  Creates a **New Agent** with the task "Open YouTube...".

### Step 3: Execution Loop (The "Brain")
The Agent enters a loop:
1.  **Observe**: Captures the current page state (accessibility tree, HTML).
2.  **Think**: Sends state to LLM.
    *   *LLM Request*: "I am at 'about:blank'. Goal: Open YouTube. What next?"
    *   *LLM Response*: "Action: Navigate to 'https://youtube.com'".
3.  **Act**: Executes `browser.navigate('https://youtube.com')`.
4.  **Stream**: Meanwhile, the **Streamer** task sees the browser is active.
    *   It takes a screenshot.
    *   Encodes it to Base64.
    *   Sends `BROADCAST_IMAGE:<data>` to Frontend.
    *   **Frontend**: Updates the `<img>` src to show the new frame.

### Step 4: Human-in-the-Loop (Safety Check)
*   **Hook**: Before every step, `on_step_start` runs.
*   **Check**: It calls `looks_sensitive(url, html)`.
*   **Scenario A (Safe)**: If URL is just YouTube, it continues.
*   **Scenario B (Sensitive)**: If URL contains `checkout` or `login`:
    1.  Server sends `HITL_STATUS:PAUSED`.
    2.  Server sends Log: `⚠️ SECURITY PAUSE: PAYMENT_FLOW detected`.
    3.  **Agent Pauses**: Waits for `RESUME` event.
    4.  **User**: Clicks "Run/Resume".
    5.  Server receives `RESUME` -> Unlocks Agent -> Continues.

### Step 5: Completion
*   **Agent**: Finds search bar, types "Python", clicks Search.
*   **LLM**: "I see search results for Python. Task complete."
*   **Server**:
    1.  Sends `✅ Task Completed`.
    2.  Sends `STREAM:STOP`.
    3.  **Closes the Browser** (Clean cleanup).
*   **Frontend**: Shows "Task Completed", clears video feed, sets status to **IDLE**.

---

## 5. WebSocket Protocol Reference

The Frontend and Backend speak a custom protocol over a single WebSocket connection.

| **Direction** | **Message Format** | **Description** |
| :--- | :--- | :--- |
| **Client -> Server** | `RUN: <task>` | Starts a new agent run. |
| **Client -> Server** | `STOP` | Hard stops the current agent and browser. |
| **Client -> Server** | `PAUSE` | Manually pauses execution. |
| **Client -> Server** | `RESUME` | Resumes a paused agent. |
| **Server -> Client** | `BROADCAST_IMAGE:<b64>` | Live video frame (JPEG Base64). |
| **Server -> Client** | `HITL_STATUS:RUNNING` | Agent is active. Disable input. |
| **Server -> Client** | `HITL_STATUS:PAUSED` | Agent is waiting for user. Show "Paused" badge. |
| **Server -> Client** | `HITL_STATUS:IDLE` | Agent finished. Enable input. |
| **Server -> Client** | `STREAM:START` | Turn on the TV (video container). |
| **Server -> Client** | `STREAM:STOP` | Turn off the TV (show "Waiting for signal"). |
| **Server -> Client** | `<Plain Text>` | Any other text is treated as a **Log Message**. |

---

## 6. Project Structure

```text
FinAgentHackathon/
├── Command-Center-Website/      # Frontend
│   ├── frontend/src/App.jsx     # Main Dashboard Logic
│   └── ...
├── finagent/                      # Backend
│   ├── agent.py                 # Core Agent Server (FastAPI + BrowserUse)
│   ├── requirements.txt         # Python Dependencies
│   └── ...
└── FINAGENT_ARCHITECTURE.md     # This file
```
