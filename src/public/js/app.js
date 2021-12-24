const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");

// socket은 서버로의 연결.
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버로 메세지를 전송할 때마다 string으로 전송해주는 함수.
// 2가지 type( message, nickname )의 메세지를 구별해 줄 수 있어야 함.
// string data만 보낼 수 있기 때문에 JSON으로 만들어야 함.
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg); // msg(object) -> string으로
}

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

// <Chat으로 보내는 메세지>
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value)); // 내가 받고 싶은 type과 payload형태로 전송.
  input.value = "";
}

// <Nickname을 변경하고 싶을 때 서버로 보내고 있음>
function handleNicknameSubmit() {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value)); // 내가 받고 싶은 type과 payload형태로 전송.
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
