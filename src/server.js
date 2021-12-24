import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); // pug로 view engine을 설정.
app.set("views", __dirname + "/views"); // express에 template이 어디 있는지 지정.
app.use("/public", express.static(__dirname + "/public")); // public url을 생성해서 유저에게 공개.

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// HttP서버에 접근할 수 있게, 이 server에서,
const server = http.createServer(app);

// HTTP서버 위에 새로운 webSocket서버를 만들 수 있다. (server를 전달 수 있도록)
const wss = new WebSocket.Server({ server });

function onSocketClose() {
  console.log("Disconnected the Browser ❌");
}

function onSocketMessage(message) {
  console.log(message.toString());
}

// socket은 서버와 브라우저사이의 연결. 즉. 연결된 브라우저.
// on method는 event가 발동하는 거 기다림. backend에 연결된 사람의 정보를 제공해줌.
wss.on("connection", (socket) => {
  // 브라우저가 연결되면,
  console.log("Connected to Browser ✅");
  // 브라우저가 꺼졌을 때를 위한 listener 등록(close)
  socket.on("close", onSocketClose);
  // 브라우저가 서버에 메세지를 보냈을 때를 위한 listener 등록(message)
  socket.on("message", onSocketMessage);
  // 브라우저에 메세지를 보내도록 만듬.
  socket.send("hello!!");
});

server.listen(3000, handleListen);
