const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

// socket은 서버로의 연결.
const socket = new WebSocket(`ws://${window.location.host}`);

// <Message 받기>
// connection이 open일 때
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

// message를 받을 때마다 내용을 출력하는 message.
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 서버가 오프라인이 됐을 때
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
