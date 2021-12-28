// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 방은 처음에 사라진 상태에서,
room.hidden = true;

// 참가한 방에 있는 사람들한테 누가 참가했는지. (1)
let roomName;

// 참가한 방에 들어가게 되면,
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  // 방 이름 표시
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value; // (2)
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
