// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const welcome = document.getElementById("welcome");
const enterForm = welcome.querySelector("form");
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

// 유저가 닉네임과 방 입력 후 방 입장하기
function handleRoomSubmit(event) {
  event.preventDefault();
  const roomNameInput = enterForm.querySelector("#roomName");
  const nickNameInput = enterForm.querySelector("#nickname");
  socket.emit("enter_room", roomNameInput.value, nickNameInput.value, showRoom);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
  const changeNameInput = room.querySelector("#nickname input");
  changeNameInput.value = nickNameInput.value;
}

enterForm.addEventListener("submit", handleRoomSubmit);

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

// 누군가가 새로운 방 입장했네~ 열려있는 모든 방의 list를 볼 수 있어~
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  // 방 목록을 비워줘서 항상 새로운 list가 되도록 하기.
  roomList.innerHTML = "";
  // 모든 방의 배열을 보여주기.
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
