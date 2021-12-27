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
