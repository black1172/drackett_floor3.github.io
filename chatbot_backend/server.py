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

OLLAMA_MODEL = "llama3"

CHUNKS_PATH = os.path.join(os.path.dirname(__file__), "data", "chunks.json")
chunks = []
if os.path.exists(CHUNKS_PATH):
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

def retrieve_chunks(query):
    # Return top 3 relevant chunks based on keyword match
    return [
        c["text"] for c in chunks
        if query.lower() in c["text"].lower()
    ][:3]

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message", "")

    relevant_chunks = retrieve_chunks(user_message)
    context = "\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."

    system_prompt = (
        "You are a helpful RA Assistant for Drackett Tower Floor 3. "
        "Format your answers clearly using short paragraphs and lists when appropriate. "
        "Always remind users to consult a real RA for important decisions. "
        "Your role is to validate feelings and provide resources only when asked for help. "
        "Be concise and avoid unnecessary filler. "
        "If the user's message is generic, such as 'test', 'hello', or not a real question, reply simply and briefly (e.g., 'Hey there!' or 'Hello!'). "
        "Only provide detailed information or resources when the user asks a specific question."
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