// io는 자동적으로 back-end socketIO와 연결해주는 함수이다.
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

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

getMedia();

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
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
