from fastapi import FastAPI, Request
import requests
import os

app = FastAPI()

OPENAI_KEY = os.environ.get("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")

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")
    chunks = body.get("chunks", [])

    prompt = f"Answer the question using these document excerpts:\n{chunks}\n\nQuestion: {user_message}"

    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    return resp.json()
