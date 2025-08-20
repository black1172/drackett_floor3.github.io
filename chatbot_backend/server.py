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
    query_words = set(query.lower().split())
    results = []
    for c in chunks:
        chunk_words = set(c["text"].lower().split())
        if query_words & chunk_words:
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
        "Format all lists using Markdown bullet points (e.g., '- item'). "
        "Use bold for section headers (e.g., '**Quiet Hours**'). "
        "Keep answers concise and easy to read. "
        "Remind users to consult a real RA for important decisions. "
        "Validate feelings and provide resources or recommendations when appropriate, especially if the resident expresses a need, concern, or asks for help. "
        "You may offer tips, resources, or advice if you believe it would benefit the resident, but only if they are official OSU resources. "
        "Please refrain from giving advice outside of OSU resources. "
        "Actively listen to the resident and respond empathetically. "
        "Do not repeat the same information in different words; avoid restating points. "
        "Let the resident guide the discussion, but feel free to offer helpful OSU information or suggestions when relevant. "
        "If the user's message is generic or not a real question (e.g., 'test', 'hello', 'I'm just checking in'), reply simply and briefly (e.g., 'Hey there!', 'Hello!', or 'Glad to hear from you! Let me know if you need anything.'). "
        "If a resident expresses a feeling (e.g., 'I'm feeling stressed'), validate their feelings and offer OSU tips or resources that may help, or ask if they would like more information. "
        "If a resident asks a specific question, answer directly and clearly, using bullet points or numbered lists if appropriate. "
        "Here are examples:\n"
        "- If a resident says 'I'm just checking in,' reply with a simple greeting and do not offer resources unless you sense they may need support.\n"
        "- If a resident says 'I'm feeling stressed,' validate their feelings and offer helpful OSU tips or resources, or ask if they would like more.\n"
        "- If a resident asks 'What are quiet hours?' answer directly with the information requested.\n"
        "---\n"
        "Example formatted answer:\n"
        "Quiet hours in Drackett Tower are:\n"
        "- Sunday to Thursday: 11pm to 8am\n"
        "- Friday and Saturday: 1am to 8am\n\n"
        "Please let me know if you have more questions!\n"
        "---\n"
        "Format all your answers similarly.\n"
        "For example:\n"
        "- If a resident says \"Hi, Hello, etc.\" reply with a simple greeting like \"Glad to hear from you! Let me know if you need anything.\" Do not offer resources unless you sense they may need support.\n"
        "- If a resident says \"I'm feeling stressed,\" validate their feelings (e.g., \"I'm sorry you're feeling that way. Here are some tips that might help...\") and offer OSU resources or advice as appropriate.\n"
        "- If a resident asks \"What are quiet hours?\" answer directly with the information requested.\n"
        "- Only provide OSU resources, tips, or advice if you believe it would benefit the resident."
    )
    # Add previous messages to the prompt
    prompt = (
        f"{system_prompt}\n\n"
        f"Conversation history:\n{history}\n\n"
        f"User: {user_message}\n"
        f"Context from RA resources:\n{context}\n\n"
    )

    print("Context sent to model:", context)

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "temperature": 0.1,
            "max_tokens": 100
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