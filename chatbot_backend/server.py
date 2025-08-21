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

OLLAMA_MODEL = "llama3:8b"

CHUNKS_PATH = os.path.join(os.path.dirname(__file__), "data", "chunks.json")
chunks = []
if os.path.exists(CHUNKS_PATH):
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

def retrieve_chunks(query):
    query_words = set(query.lower().split())
    results = []
    for c in chunks:
        # Combine text and tags for matching
        chunk_text = c.get("text", "").lower()
        chunk_tags = " ".join(c.get("tags", [])).lower()
        chunk_content = f"{chunk_text} {chunk_tags}"
        if query_words & set(chunk_content.split()):
            results.append(c["text"])
    return results[:3]

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")
    history = body.get("history", "")  # <-- Get history from frontend

    relevant_chunks = retrieve_chunks(user_message)
    context = "\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Always use relevant information from the provided context (from RA resources in the chunks JSON file) to answer questions. "
        "Format your answers clearly using short paragraphs and bullet-point lists when appropriate. "
        "Keep responses concise and easy to read."
    )
    # Add previous messages to the prompt
    prompt = (
        f"{system_prompt}\n\n"
        f"Conversation history (most recent first):\n"
        f"{history}\n\n"
        f"User: {user_message}\n"
        f"Context from RA resources:\n{context}\n\n"
    )

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "temperature": 0.1,
            "max_tokens": 50
        }
    )

    full_response = ""
    for line in response.iter_lines():
        if line:
            try:
                obj = json.loads(line)
                full_response += obj.get("response", "")
            except Exception:
                continue

    print("Ollama full response:", full_response)
    print("\nOllama Context:", context)

    if full_response:
        return {"response": full_response}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}