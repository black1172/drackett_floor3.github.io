let chunks = [];

// Load chunked data from JSON file in your repo
async function loadChunks() {
    const res = await fetch('data/chunks.json');
    chunks = await res.json();
}
loadChunks();

// Simple keyword search (replace with vector search if needed)
function searchChunks(query) {
    return chunks
        .filter(c => c.text.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3); // top 3 matches
}

const BACKEND_URL = "https://usually-elementary-zero-port.trycloudflare.com/chat";

// Send message to AI
async function sendMessage() {
    const inputElem = document.getElementById("chat-input");
    const input = inputElem.value.trim();
    if (!input) return;

    displayMessage("You", input);
    inputElem.value = ""; // Clear immediately after sending

    // If you use chunks, add them here; otherwise, just send the message
    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    let botReply = "";

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        botReply = data.choices[0].message.content;
    } else if (data.response) {
        botReply = data.response;
    } else {
        botReply = "Sorry, I couldn't get a response from the AI.";
    }

    displayMessage("Bot", botReply);
}

// Improved displayMessage for iMessage-style UI
function displayMessage(sender, text) {
    const chatMessages = document.getElementById("chat-messages");
    const msg = document.createElement("div");
    msg.classList.add("chat-message");
    msg.classList.add(sender === "You" ? "user" : "bot");
    msg.innerHTML = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners for send button and Enter key
window.addEventListener("DOMContentLoaded", function() {
    // Welcome message
    displayMessage("Bot", "👋 Hi! I'm your RA Assistant. How can I help you today?");
    
    document.getElementById("chat-send").addEventListener("click", function(e) {
        e.preventDefault();
        sendMessage();
    });
    document.getElementById("chat-input").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
});
