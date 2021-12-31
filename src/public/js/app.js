// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

// < Phone call Code >
const call = document.getElementById("call");

// 처음 call화면은 숨기고,
call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection; // 이 연결을 모든곳에 공유
let myDataChannel;

// <카메라 목록을 만들게 되면, 유저가 종류 선택해서 가져오기>
async function getCameras() {
  try {
    // 모든 장치들의 정보(list)를 가져온다.
    const devices = await navigator.mediaDevices.enumerateDevices();
    // 그 중, 각각의 device를 필터해서 videoinput이라는 kind를 가진 device만을 원한다.
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // 비디오Track 생성 첫번째 track을 가져온다.
    const currentCamera = myStream.getVideoTracks()[0];
    // 유저가 카메라종류 선택하게끔, 각 카메라에 대한 새로운 option을 만들어준다.
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId; // 옵션 값: 카메라의 deviceId
      option.innerText = camera.label; // 옵션 텍스트: 카메라의 모델명
      // stream의 현재 카메라와 paint할 때의 카메라 option을 가져와서 연동시킴.
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

// <화면에 비디오 보여주기> - 현재 선택된 deviceID를 가져오고 stream에서 강제로 변경
async function getMedia(deviceId) {
  // 초기 제약조건 설정 - deviceId (❌)
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" }, // 셀프 카메라
  };
  // 새로운 제약조건 설정 - deviceId만 (✅) (만약 찾지 못하면 비디오 표시 ❌)
  const newConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } }, // 특정 카메라
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? newConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    // deviceID가 없다면 카메라를 가져온다. [처음에 getMdeia()를 할 때만 실행됨.] - 수많은 카메라가 생성되지 않도록.
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

// <Mute 버튼 생성>
function handleMuteClick() {
  // 오디오Track 생성
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

// <Camera 버튼 생성>
function handleCameraClick() {
  // 비디오Track 생성
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

// <카메라 전환> - 사용하려는 특정 카메라 Id 전송 [select 변경]
async function handleCameraChange() {
  // 비디오 device의 새로운 id로 다시 또 다른 stream을 생성함.
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    // 내가 선택한 새로운 장치로 업데이트 된 비디오Track을 받는다.
    const videoTrack = myStream.getVideoTracks()[0]; // 나 자신을 위한 my Stream
    // Sender : 우리의 peer로 보내진 media stream track을 컨트롤하게 해주는 역할.
    // track:{kind:"video"}를 가진 Sender를 찾아서 getSender 한다.
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video"); // 다른 브라우저로 보내진 비디오와 오디오 데이터를 보내는 컨트롤
    videoSender.replaceTrack(videoTrack); // Sender를 videoTrack으로 바꾼다.
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// < Welcome Form (방에 참가하기) Code >

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

// 양쪽 브라우저에서 돌아가는 Code
// welcome form은 숨기고, phone call을 보여주며 카메라,마이크 등 화면 불러오기
async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

// Welcome 화면에서 방에 참가하기
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall(); // Media를 가져오는 속도가 연결을 만드는 속도보다 빠르기 때문에 변경.
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// < Socket Code >

// Peer B가 방에 참가하면, Peer A에서 실행되는 코드.
socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat"); // Peer A의 DataChannel 정의
  myDataChannel.addEventListener("message", (event) => console.log(event.data));
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName); // offer 전송
});

// Peer B가 offer를 받아서 Peer B에서 실행되는 코드.
socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel; // 새 Data Channel이 있을 때 그 Data Channel을 저장함.
    myDataChannel.addEventListener("message", (event) =>
      console.log(event.data)
    ); // 그 Data Channel에 eventlistener를 추가할 것임.
  }); // Peer B의 DataChannel 정의
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName); // answer 전송
  console.log("sent the answer");
});

// Peer B로부터 받은 answer로 인해 Peer A에서 실행되는 코드.
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

// Peer A or Peer B 브라우저가 candidate들을 서로 받는 실행코드.
socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// <RTC Code >

// 실제로 연결통로를 만드는 함수
function makeConnection() {
  // 양쪽 브라우저에서 peer-to-peer 연결 만듦.
  // STUN 서버 : 너의 장치에 공용 IP를 알려주는 서버. [양쪽 브라우저가 서로 다른 네트워크에 있을 때 필요]
  // 일단은, 구글이 무료로 제공하는 STUN 서버
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  // IceCandidate - 브라우저가 서로 소통할 수 있게 해주는 방법
  // [ Ice (Interactive Connectivity Establishment) : 인터넷 연결 생성 ]
  // [ Candidate : 브라우저가 '헤이,이게 우리가 소통하는 방법이야'라고 알려주는 방식. ]
  myPeerConnection.addEventListener("icecandidate", handleIce);
  // 양쪽 브라우저의 stream을 주고 받음.
  myPeerConnection.addEventListener("addstream", handleAddStream);
  // 양쪽 브라우저에서 카메라,마이크의 데이터 stream을 받아서 myPeerConnection안에 집어넣었음.
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// Peer A or Peer B 브라우저가 candidate들을 서로 주는 실행코드.
function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

// Peer A Peer B 브라우저의 stream을 서로 주고 받는 실행코드.
function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream; // 다른 브라우저의 stream
}
