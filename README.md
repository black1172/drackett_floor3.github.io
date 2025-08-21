# Drackett Floor 3 RA Assistant – Ohio State University

---

## Project Context

**Audience:**  
Residents of Drackett Tower Floor 3, Ohio State University

**Use Case:**  
Provide quick, judgment-free access to campus resources, answer common questions about events/newsletters, and connect students with support services.

**Why Drackett?**  
As a freshman dorm, Drackett houses many students who are new to campus and may feel hesitant to ask for help directly. This assistant bridges that gap by making information approachable, available 24/7, and tailored to their needs.

**Accessibility:**  
Many students struggle to navigate OSU’s numerous websites or don’t know where to start. By centralizing information and using natural language queries, the assistant reduces barriers and ensures all students can quickly find what they need.

---

## Technical Highlights

- **Backend:**  
  FastAPI (Python) with RESTful API endpoints and CORS configuration for secure web integration.

- **AI Model:**  
  Ollama running Llama 3 8B for conversational intelligence.

- **Contextual Search:**  
  Matches user queries to curated OSU resource chunks using tag-based and substring filtering with stopword removal for precision.

- **Prompt Engineering:**  
  Guides the AI to stay focused on context, avoid repetition, and connect users to official OSU resources.

- **Session Handling:**  
  Tracks only the last user and bot messages for concise, context-aware conversations.

- **Debugging Tools:**  
  Console outputs for matched chunks and context enable testing, verification, and refinement.

---

## Skills Demonstrated

- **API Design & Integration:**  
  Built a backend that connects seamlessly to a web frontend and an external AI model.

- **Natural Language Processing:**  
  Implemented custom query filtering and context-matching logic with NLTK.

- **Data Structuring:**  
  Designed a structured JSON knowledge base of campus resources, events, and support services.

- **Prompt Engineering:**  
  Developed system prompts that ensure accurate, supportive, and reliable responses.

- **Accessibility in Tech:**  
  Focused on reducing friction for freshmen and ensuring equal access to resources.

- **Testing & Debugging:**  
  Implemented both automated and manual methods to validate accuracy and performance.

---

## Why This Matters

This project addresses a critical challenge for first-year students: navigating a large university environment with limited knowledge and confidence. By building a digital RA assistant, I demonstrate my ability to:

- Build production-ready AI chatbots with real-world student needs in mind.
- Integrate advanced language models into practical applications.
- Engineer context logic for reliable, supportive answers.
- Design with accessibility and inclusivity at the core.
- Translate technical solutions into meaningful impact for end-users.

## For Employers & Reviewers

Explore my related projects and source code on GitHub:

- [Drackett Floor 3 RA Chatbot (Frontend & Backend)](https://github.com/black1172/drackett_floor3.github.io)
- [OSU Data Chunker (Resource Chunk Extraction)](https://github.com/black1172/Data_Chunker_Python)
