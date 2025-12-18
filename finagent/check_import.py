from dotenv import load_dotenv
load_dotenv()
try:
    from browser_use.browser.browser import BrowserSession
    print("Import successful: browser_use.browser.browser.BrowserSession")
except ImportError:
    print("Import failed path 1")
    try:
        from browser_use.browser.session import BrowserSession
        print("Import successful: browser_use.browser.session.BrowserSession")
    except ImportError:
         try:
            from browser_use import BrowserSession
            print("Import successful: browser_use.BrowserSession")
         except ImportError:
            print("Import failed all paths")
