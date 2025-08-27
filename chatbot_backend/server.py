from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import json
import os
import nltk
from nltk.corpus import stopwords
import smtplib
from email.message import EmailMessage

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

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

def filter_query_words(query):
    words = query.lower().split()
    filtered = [w for w in words if w not in stop_words and len(w) > 2]
    return filtered

def retrieve_chunks(query):
    query_words = set(filter_query_words(query))
    results = []
    for c in chunks:
        chunk_tags = [tag.lower() for tag in c.get("tags", [])]
        # Only match substrings if query word is at least 4 characters
        if any(
            any((len(q) > 3 and (q in tag or tag in q)) or q == tag for tag in chunk_tags)
            for q in query_words
        ):
            results.append(c["text"])
    return results[:5]

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
        "You are a helpful RA Assistant for Ohio State University. "
        "Use the information found in the provided context to answer questions directly. "
        "If the context does not contain the answer, provide general information about Ohio State University or refer students to their floor RA or www.osu.edu. "
        "Keep responses concise, clear, short, and supportive. "
        "Do not greet the user at the start of every response. "
        "For floor (3) event and newsletter questions, refer to the sections available on the website. "
        "Your main purpose is to connect users to the most relevant OSU resources, including links if available. "
        "If you don't know the answer, it's okay to say so."
        "CAPS does not exist only CCS"
        "Do not repeat information in history from bot"
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
            "max_tokens": 200
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
    print("Matched chunk tags:", [c.get("tags", []) for c in chunks if any(any(q in tag or tag in q for tag in [tag.lower() for tag in c.get("tags", [])]) for q in filter_query_words(user_message))])

    if full_response:
        return {"response": full_response}
    else:
        return {"response": "Sorry, I couldn't get a response from the AI."}

@app.post("/report-bug")
async def report_bug(request: Request):
    data = await request.json()
    desc = data.get("description", "")
    user_email = data.get("user_email", "")
    msg = EmailMessage()
    msg["Subject"] = "Bug Report from Drackett Floor 3 Website"
    msg["From"] = "yourserveremail@osu.edu"
    msg["To"] = "black.1172@buckeyemail.osu.edu"
    msg.set_content(f"Description:\n{desc}\n\nUser Email: {user_email}")

    # Send email (configure SMTP for your server)
    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login("yourgmail@gmail.com", "your-app-password")
        smtp.send_message(msg)

    return JSONResponse({"success": True})

@app.get("/")
async def root():
    return {"message": "RA Chatbot backend is running."}