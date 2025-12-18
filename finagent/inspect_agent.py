from browser_use import Agent
import inspect

def inspect_agent():
    print("Agent.__init__ arguments:")
    sig = inspect.signature(Agent.__init__)
    for name, param in sig.parameters.items():
        print(f"{name}: {param.default}")

if __name__ == "__main__":
    inspect_agent()
