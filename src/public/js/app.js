// socket은 서버로의 연결.
const socket = new WebSocket(`ws://${window.location.host}`);

// <Message 받기>
// connection이 open일 때
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

// message를 받을 때마다 내용을 출력하는 message.
socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

// 서버가 오프라인이 됐을 때
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

setTimeout(() => {
  socket.send("hello from the browser!");
}, 10000);
