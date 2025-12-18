import asyncio
import sys

async def async_input(prompt: str = "") -> str:
    """
    Asynchronous input wrapper to prevent blocking the event loop.
    This allows the browser (Playwright) to remain active in the background.
    """
    print(prompt, end='', flush=True)
    return await asyncio.to_thread(sys.stdin.readline)
