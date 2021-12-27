import http from "http";
import SocketIO from "socket.io";
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

// HTTP서버 위에 새로운 SocketIO서버로 wsServer(io)를 볼 수 있다. (httpServer를 전달 수 있도록)
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
    setTimeout(() => {
      done();
    }, 10000);
  });
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
