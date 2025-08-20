from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://black1172.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_MODEL = "mistral"

# Load chunks.json once at startup
CHUNKS_PATH = os.path.join(os.path.dirname(__file__), "data\chunks.json")
with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunks = json.load(f)

def retrieve_chunks(user_message, top_k=3):
    """Return top_k chunks most relevant to the user message using keyword overlap."""
    keywords = set(user_message.lower().split())
    scored = []
    for chunk in chunks:
        text = chunk.get("text", "").lower()
        score = sum(1 for word in keywords if word in text)
        if score > 0:
            scored.append((score, chunk["text"]))
    scored.sort(reverse=True)
    return [text for _, text in scored[:top_k]]

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    # Retrieve relevant chunks
    relevant_chunks = retrieve_chunks(user_message)
    context = "\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Format your answers clearly using short paragraphs and lists. "
        "Always remind users to consult a real RA for important decisions. "
        "Your role is to validate feelings and provide resources."
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