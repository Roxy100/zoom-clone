// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 방은 처음에 사라진 상태에서,
room.hidden = true;

// 참가한 방에 있는 사람들한테 누가 참가했는지. (1)
let roomName;

// 수많은 메시지를 보여줄 것이기 때문에 <메시지 추가 함수> 를 따로 만들어서 자주 사용하도록.
function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 방_메시지
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const { value } = input;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

// 방_닉네임
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#nickname input");
  socket.emit("nickname", input.value);
}

// 참가한 방에 들어가게 되면,
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  // 방 이름 표시
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  // 방_메시지 표시
  const msgForm = room.querySelector("#msg");
  // 방_닉네임 표시
  const nicknameForm = room.querySelector("#nickname");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nicknameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value; // (2)
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// emit("welcome")에 반응하도록 Front-end에선, 수많은 메시지를 보여준다.
// 누군가 입장했어!
socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

// 누군가 떠났어 ㅠㅠ
socket.on("bye", (user) => {
  addMessage(`${user} left ㅠㅠ`);
});

// 누군가가 메시지 추가했네~
socket.on("new_message", addMessage);
