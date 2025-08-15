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

// Send message to AI
async function sendMessage() {
    const inputElem = document.getElementById("chat-input");
    const input = inputElem.value.trim();
    if (!input) return;

    displayMessage("You", input);

    const topChunks = searchChunks(input); // Your JSON search function
    const response = await fetch("https://ra-chatbot-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, chunks: topChunks.map(c => c.text) })
    });

    const data = await response.json();
    displayMessage("Bot", data.choices[0].message.content);

    inputElem.value = "";
}

function displayMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}
