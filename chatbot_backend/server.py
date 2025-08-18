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

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
print("Loaded API key:", OPENAI_KEY)

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful RA Assistant for Drackett Tower Floor 3. "
                "Respond concisely and factually. Avoid unnecessary details or creativity. "
                "Always remind users to consult a real RA for important decisions. "
                "Format your responses in clear, short paragraphs. Use bullet points for lists. Avoid long blocks of text. "
                "If you don't know the answer, it's okay to say so. "
                "Its most important to provide resources, connect the user with the right information."
                "Remove instances of double asterisks in responses."
            )
        },
        {"role": "user", "content": user_message}
    ]

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.3,  # Lower temperature = less creativity
            "max_tokens": 300    # Limit response length
        }
    )

    print("OpenAI response headers:", response.headers)  # Debug: show rate limit headers
    print("OpenAI response status code:", response.status_code)
    print("OpenAI response body:", response.text)

    data = response.json()
    if "choices" in data and data["choices"]:
        return {"response": data["choices"][0]["message"]["content"]}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}