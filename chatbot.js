async function sendMessage(message) {
    const response = await fetch("https://your-render-url.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.response;
}