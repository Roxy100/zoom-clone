import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug"); // pug로 view engine을 설정.
app.set("views", __dirname + "/views"); // express에 template이 어디 있는지 지정.
app.use("/public", express.static(__dirname + "/public")); // public url을 생성해서 유저에게 공개.

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// HTTP서버에 접근할 수 있게, 이 httpServer에서,
const httpServer = http.createServer(app);

// HTTP서버 위에 새로운 Server로 wsServer(io)를 볼 수 있다. (httpServer를 전달 수 있도록)
// 온라인 데모가 작동할 수 있게끔 origin URL에서 작동되는 환경설정
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

// public rooms를 주는 함수
// socket의 Id를 뜻하는 sids.
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  // public rooms list 만들기
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

// 사용자 수를 세주는 함수
// roomName을 찾을수도 있고 아닐 수도 있기 때문에 '?' 붙임.
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// onAny 는 어느 event에서든지 console.log를 할 수 있다.
// 결과 : Socket Event: enter_room
wsServer.on("connection", (socket) => {
  wsServer.sockets.emit("room_change", publicRooms());
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  // 방 입장
  socket.on("enter_room", (roomName, nickname, done) => {
    socket["nickname"] = nickname;
    // roomName으로 방에 참가해보자.
    socket.join(roomName);
    done();
    // 참가한 모든 사람에게 room Message 보내기
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    // 모든 방에게 새로운 방이 만들어졌다고 공지 Message 보내기
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 방 퇴장
  // 'disconnecting' 은 고객이 접속을 중단할 것(ex.창 닫기)이지만 아직 연결이 끊어지지 않은 그 찰나에 발생하는 것. (room정보가 살아있음.)
  // 즉, 방 퇴장하기 직전
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  // 'disconnect' 은  연결이 완전히 끊어졌을 때 발생한는 것.(room 정보가 비어있음.)
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 방_메시지
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  // 방_닉네임
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// function onSocketClose() {
//   console.log("Disconnected the Browser ❌");
// }

// // 받은 message를 다른 모든 sockets에 전달해줄 수 있는 가짜 서버.
// // 이 서버 하나로 다른 브라우저간의 message를 전달해 줄 수 있다.
// const sockets = [];

// // socket은 서버와 브라우저사이의 연결. 즉. 연결된 브라우저.
// // on method는 event가 발동하는 거 기다림. backend에 연결된 사람의 정보를 제공해줌.
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   // nickname을 정하지 않은 사람들.
//   socket["nickname"] = "Anon";
//   // 브라우저가 연결되면,
//   console.log("Connected to Browser ✅");
//   // 브라우저가 꺼졌을 때를 위한 listener 등록(close)
//   socket.on("close", onSocketClose);
//   // 브라우저가 서버에 메세지를 보냈을 때를 위한 listener 등록(message)
//   // 각 브라우저 - aSocket
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       // new_message이면 자신과 다른 브라우저에 전송됨.
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       // nickname을 socket안에 넣어 줘야 socket이 누구인지 알 수 있기 때문에
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
