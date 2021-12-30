import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug"); // pug로 view engine을 설정.
app.set("views", __dirname + "/views"); // express에 template이 어디 있는지 지정.
app.use("/public", express.static(__dirname + "/public")); // public url을 생성해서 유저에게 공개.

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// HTTP서버에 접근할 수 있게, 이 httpServer에서,
const httpServer = http.createServer(app);

// HTTP서버 위에 새로운 wsServer로 wsServer(io)를 볼 수 있다. (httpServer를 전달 수 있도록)
const wsServer = SocketIO(httpServer);

// 서버 연결
wsServer.on("connection", (socket) => {
  // 방 참가
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });

  // Offer 서버
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
