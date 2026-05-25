import httpx
import asyncio

async def test():
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            print("Sending request...")
            r = await client.post("http://localhost:11434/api/chat", json={
                "model": "llama3:latest",
                "messages": [{"role": "user", "content": "say hi in one word"}],
                "stream": False
            })
            print("Status:", r.status_code)
            print("Response:", r.json()["message"]["content"])
    except Exception as e:
        print(f"ERROR TYPE: {type(e).__name__}")
        print(f"ERROR: {e}")

asyncio.run(test())