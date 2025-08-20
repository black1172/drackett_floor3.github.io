from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Allow requests from your GitHub Pages domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://black1172.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_MODEL = "mistral"  # Change to your preferred model

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Format your answers clearly using short paragraphs and lists. "
        "Do not use asterisks (*) for formatting, even if they appear in provided data. "
        "Use plain text or numbered/bulleted lists with dashes or numbers instead. "
        "Always remind users to consult a real RA for important decisions."
    )
    prompt = f"{system_prompt}\nUser: {user_message}"

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "temperature": 0.3,
            "max_tokens": 300
        }
    )

    print("Ollama response status code:", response.status_code)
    print("Ollama response body:", response.text)

    data = response.json()
    if "response" in data:
        return {"response": data["response"]}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}