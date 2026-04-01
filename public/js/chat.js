const socket = io();

function sendMessage() {
    const input = document.getElementById("msg");
    const content = input.value;

    socket.emit("sendMessage", {
        content: content
    });

    input.value = "";
}

socket.on("receiveMessage", (msg) => {
    const box = document.getElementById("chat-box");

    const p = document.createElement("p");
    p.innerText = msg.content;

    box.appendChild(p);
});