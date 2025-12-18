import os
from playwright.async_api import async_playwright, BrowserContext

class BrowserManager:
    _instance = None
    _playwright = None
    _context = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BrowserManager, cls).__new__(cls)
        return cls._instance

    async def get_persistent_context(self) -> BrowserContext:
        """
        Returns a persistent BrowserContext using native Playwright.
        """
        if self._context is None:
            if self._playwright is None:
                self._playwright = await async_playwright().start()
            
            user_data_dir = os.path.join(os.getcwd(), "browser_data")
            
            # Launch persistent context
            # This saves cookies/state to user_data_dir automatically.
            self._context = await self._playwright.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                headless=False,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-first-run",
                    "--no-default-browser-check"
                ],
                no_viewport=True,
            )
        
        return self._context

    async def ensure_single_page(self):
        """
        Ensures only one page is open.
        """
        context = await self.get_persistent_context()
        pages = context.pages
        
        if not pages:
            return await context.new_page()
            
        # Clean up about:blank pages if we have others
        if len(pages) > 1:
            for page in pages:
                if page.url == "about:blank":
                    await page.close()
                    
        # Refresh pages list
        pages = context.pages
        if not pages:
             return await context.new_page()
             
        # Return the last one (usually the most recent active one)
        return pages[-1]

browser_manager = BrowserManager()
