BACKEND_URL = "https://asia-hazard-armstrong-attached.trycloudflare.com/chat";

let history = "";
let lastUser = "";
let lastBot = "";

// Send message to AI
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-messages");
    const userText = input.value.trim();
    if (!userText) return;

    lastUser = `User: ${userText}`;

    displayMessage("user", userText);

    // Show thinking animation
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "bot-message";
    thinkingDiv.innerHTML = `
      <span class="thinking">
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
      </span> Thinking...`;
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    input.value = "";

    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText, history: `${lastUser}\n${lastBot}` })
        });
        const data = await res.json();

        // Remove thinking animation
        chatBox.removeChild(thinkingDiv);

        lastBot = `Bot: ${data.response}`;

        displayMessage("bot", data.response || "Sorry, no response.");
    } catch (err) {
        chatBox.removeChild(thinkingDiv);
        displayMessage("bot", "Error connecting to server.");
    }
}

// Improved displayMessage for iMessage-style UI
function displayMessage(sender, text) {
    const chatBox = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
    // Convert Markdown to HTML for bot messages
    if (sender === "bot") {
        messageDiv.innerHTML = marked.parse(text);
    } else {
        messageDiv.textContent = text;
    }
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Check backend status
async function checkBackendStatus() {
    const chatBox = document.getElementById("chat-messages");
    // Remove any existing messages
    chatBox.innerHTML = "";

    try {
        const res = await fetch(BACKEND_URL.replace("/chat", "/"), { method: "GET" });
        if (res.ok) {
            displayMessage("bot", "👋 Hi! I'm your RA Assistant. How can I help you today?");
        } else {
            displayMessage("bot", "Chatbot is currently down. Please try again later.");
        }
    } catch {
        displayMessage("bot", "Chatbot is currently down. Please try again later.");
    }
}

// Fetch reservations from the backend
async function fetchReservations() {
    const res = await fetch(BACKEND_URL.replace("/chat", "/reservations"), { method: "GET" });
    if (res.ok) {
        return await res.json();
    }
    return {};
}

// Event listeners for send button and Enter key
window.addEventListener("DOMContentLoaded", function() {
    history = "";      // Clear history on page reload
    lastUser = "";     // Clear last user message
    lastBot = "";      // Clear last bot response
    checkBackendStatus();
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
