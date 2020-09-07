const video = document.getElementById("video");

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

startVideo();

const closeButton = document.getElementById("close-button");
const modal = document.getElementById("modal");

function getRandomTranslate() {
  const rangeX = window.innerWidth / 2 - 190;
  const rangeY = window.innerHeight / 2 - 160;

  return {
    x: rangeX - Math.random() * 2 * rangeX,
    y: rangeY - Math.random() * 2 * rangeY,
  };
}

closeButton.addEventListener("mouseover", function (event) {
  const { x, y } = getRandomTranslate();

  modal.style.transform = `translate(${x}px, ${y}px)`;
});
