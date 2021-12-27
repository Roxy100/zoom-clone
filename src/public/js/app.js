// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

// 한번 더! Front-end에서 실행된 코드는 Back-end가 실행을 시킨 것임.
// server.js에서 done()호출 때문에.
function backendDone(msg) {
  console.log(`The backend says: `, msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, backendDone);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
