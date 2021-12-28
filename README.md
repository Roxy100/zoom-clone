# Noom

Zoom Clone using NodeJS, WebRTC and Websockets.

---

## HTTP vs WebSockets

- 공통점 : Protocol( 프로토콜 : 어떤 사람들이 어딘가에 있는 방에서 만나고 어떻게 일들이 진행될지를 결정함. 어떻게 모든 것이 돌아가야 할지에 대한 규칙을 만든다. 프로그래머는 표준이 되는 규칙을 코드에 녹여내는 것. ). 브라우저-Backend, Backend-Backend에서 발생가능.
- HTTP : 유저가 request를 보내면, 서버가 response로 반응해 준다. [탁구]
  Stateless(무상태) : Backend에서는 '유저'를 기억하지 못하고, '유저'에게 답해줄 수만 있다. 브라우저(Client)는 request만 할 수 있다. 즉, '유저'와 Backend사이에 아무런 연결이 없다는 뜻.

- WebSockets : 브라우저가 서버로 WebSocket request를 보내면, 서버가 받거나 거절하기를 한다. 이런 [악수]가 한 번 성립(establish)이 되는 것. 이 성립이 되면, [양방향연결]이 생김. 연결이 되어있기 때문에, 메시지를 보내고 받고, 또 원하는 만큼 할 수도 있고, 순서도 상관없다. request-response 같은 건 필요없다.
  - 브라우저에는 내장된 WebSocket API가 있다.
  - ws : implementation일 뿐. webSocket의 핵심부분.

---

## SocketIO vs WebSockets

- SocketIO : WebSocket을 실행하는 게 아니라 가끔 WebSocket을 이용해서 실시간, 양방향, event 기반 통신을 제공하는 framework이다. 'WebSocket의 부가기능'이 아니다. WebSocket이용이 불가능해지면, 다른 방법(것)을 이용해서 계속 작동할 것이다.
  - front-end 와 back-end에 socketIO를 설치해주어야 한다.
  - [SocketIO작성법] 예시
    Front-end에서,
    - socket.emit()의 1번재 argument에는 커스텀한 event이름의 text(string)
    - socket.emit()의 2번째 argument에는 (어떤 것이든 전송할 수 있는) 보내고 싶은 payload.(JSON Object) [여러가지를 보낼 수 있다.]
    - socket.emit()의 마지막 argument에는 서버에서 호출하는 Callback function
    ```
     socket.emit("enter_room", { payload: input.value }, () => {
     console.log("server is done!");
     });
    ```
  - Back-end에서,
    - socket.on()의 1번째 argument에는 커스텀한 event이름의 text(string)
    - socket.on()의 2번째 argument인 done이라는 function을 10초 뒤 호출하면서 front-end에서 그 함수가 실행되는 것.
    ```
     socket.on("enter_room", (msg, done) => {
     console.log(msg);
     setTimeout(() => {
     done();
     }, 10000);
     });
    ```

---

### Adapter

- Adapter가 기본적으로 하는 일은 다른 서버들 사이에 실시간 어플리케이션을 동기화하는 것.
  - MongoDB를 사용해서 서버간의 통신을 해주는 것.
  - 어플리케이션으로 통하는 [창문]과 같은 역할.
  - 누가 연결되었는지, 현재 어플리케이션에 room이 얼마나 있는지 알려준다.

### Map & Set 구조

<Map 구조>

- 예시

  ```
   const food = new Map()
   < undefined
   food
   < Map(0) {size: 0}
   food.set("pizza", 12)
   < Map(1) {'pizza' => 12}
   food.get("pizza")
   < 12
   food.get("lalala")
   < undefined
  ```

- 본격적인 예시

  ```
   const sids = new Map()
   < undefined
   sids.set("R98ps0fmEt4Dr1_lAAAB", true)
   < Map(1) {'R98ps0fmEt4Dr1_lAAAB' => true}
   sids.set("6rmYq1v33daN8xhFAAAF", true)
   < Map(2) {'R98ps0fmEt4Dr1_lAAAB' => true, '6rmYq1v33daN8xhFAAAF' => true}
   sids
   < Map(2) {'R98ps0fmEt4Dr1_lAAAB' => true, '6rmYq1v33daN8xhFAAAF' => true}
   const rooms = new Map()
   < undefined
   rooms.set("R98ps0fmEt4Dr1_lAAAB", true)
   < Map(1) {'R98ps0fmEt4Dr1_lAAAB' => true}
   rooms.set("6rmYq1v33daN8xhFAAAF", true)
   < Map(2) {'R98ps0fmEt4Dr1_lAAAB' => true, '6rmYq1v33daN8xhFAAAF' => true}
   rooms.set("roxy", true)
   < Map(3) {'R98ps0fmEt4Dr1_lAAAB' => true, '6rmYq1v33daN8xhFAAAF' => true, 'roxy' => true}
  ```

#### 모든 socket은 private room이 있다는 걸 기억하기!

- sids : 서버에 연결된 모든 sockets들의 map
- rooms : public room 2개와 private room 'roxy'
  - room id = socket id

#### map을 반복하거나 살펴볼 수 있는지 확인

```
 rooms.forEach((value,key)=> console.log(value,key))
 true 'R98ps0fmEt4Dr1_lAAAB'
 true '6rmYq1v33daN8xhFAAAF'
 true 'roxy'
```

#### map 안에 있는 것을 가져오기

- get과 'key'를 이용해서 key가 socketID인지 아니면 방 제목인지 알 수 있도록.
- private room이 아닌 방만 찾음.

```
rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
    console.log(key)
    }
})
```

결과 : roxy

<Set 구조>

- 예시

  ```
  const food = new Set(["pizza","love","love"])
  > undefined
  food
  > Set(2) {'pizza', 'love'}
  food.size
  > 2
  ```

### Admin Panel

- Socket.IO 백엔드를 위한 것! Admin UI!!!
- https://admin.socket.io ㄱㄱ !
- Server URL : 로컬호스트/admin
  - Server
  ```
  const wsServer = new Server(httpServer, {
  cors: {
  origin: ["https://admin.socket.io"],
  credentials: true,
  },
  });
  instrument(wsServer, {
  auth: false,
  });
  ```

---
