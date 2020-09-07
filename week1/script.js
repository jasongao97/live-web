const video = document.getElementById("video");
const videoAlt = document.getElementById("video-alt");
const closeButton = document.getElementById("close-button");
const modal = document.getElementById("modal");

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      videoAlt.style.display = 'none';
      video.style.display = 'block';
      clearInterval(getVideoInterval);
    })
    .catch((err) => {
      videoAlt.style.display = 'inline';
      video.style.display = 'none';
    });
}

function getRandomTranslate() {
  const rangeX = window.innerWidth / 2 - 190;
  const rangeY = window.innerHeight / 2 - 160;

  return {
    x: rangeX - Math.random() * 2 * rangeX,
    y: rangeY - Math.random() * 2 * rangeY,
  };
}

/**
 * start finding webcam until one is attached
 */
const getVideoInterval = setInterval(() => {
  startVideo();
}, 1000);

/**
 * move the pop-up modal to a random place when mouse is over the close button
 */
closeButton.addEventListener("mouseover", function (event) {
  const { x, y } = getRandomTranslate();

  modal.style.transform = `translate(${x}px, ${y}px)`;
});
