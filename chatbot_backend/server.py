from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://black1172.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_MODEL = "mistral"

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    # No chunk retrieval; context is empty or generic
    context = "No relevant context found."

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Format your answers clearly using short paragraphs and lists. "
        "Always remind users to consult a real RA for important decisions. "
        "Your role is to validate feelings and provide resources."
        "Be concise and avoid unnecessary filler. Only respond with relevant information."
        "Do not give resources when unrelated or unprompted for help."
    )
    prompt = (
        f"{system_prompt}\n\n"
        f"Context from RA resources:\n{context}\n\n"
        f"User: {user_message}"
    )

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "temperature": 0.1,
            "max_tokens": 300
        }
    )

    # Collect all 'response' fields from each JSON line
    full_response = ""
    for line in response.iter_lines():
        if line:
            try:
                obj = json.loads(line)
                full_response += obj.get("response", "")
            except Exception:
                continue

    print("Ollama full response:", full_response)

    if full_response:
        return {"response": full_response}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}