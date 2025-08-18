from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI()

# Allow requests from your GitHub Pages domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://black1172.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_KEY = os.environ.get("OPENAI_KEY")

headers = {
    "Authorization": f"Bearer {OPENAI_KEY}",
    "Content-Type": "application/json"
}

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": user_message}]
        }
    )

    data = response.json()
    print(data)  # Debug: see what OpenAI returns
    if "choices" in data and data["choices"]:
        return {"response": data["choices"][0]["message"]["content"]}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}