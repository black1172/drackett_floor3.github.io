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
        chunk_tags = set(tag.lower() for tag in c.get("tags", []))
        # Include chunk if any query word matches any tag
        if query_words & chunk_tags:
            results.append(c["text"])
    return results[:3]

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")
    history = body.get("history", "")  # Only previous exchanges

    # Context is only from chunks
    relevant_chunks = retrieve_chunks(user_message)
    context = "\n\n".join(relevant_chunks) if relevant_chunks else (
        "I don't have specific details on that, but you can find general information about Ohio State University at www.osu.edu."
    )

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Use the information found in the provided context to answer questions as best you can. "
        "If the context does not contain the answer, reply with helpful general information about Ohio State University or refer to floor RA's or www.osu.edu."
        "Do not greet user upon every response."
        "For floor (3) event and newsletter questions refer to the sections available on the website."
        "Your main purpose is to connect users to relevant resources."
    )

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
            "temperature": 0.2,
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