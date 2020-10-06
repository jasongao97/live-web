const socket = io.connect();
socket.on("connect", function () {
  console.log("Connected");
});

const video = document.getElementById("myvideo");
const canvas = document.getElementById("mycanvas");
const context = canvas.getContext("2d");
context.imageSmoothingQuality = "high";

function start() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      clearInterval(getVideoInterval);

      video.onloadedmetadata = function (e) {
        video.play();
        requestAnimationFrame(draw);
        sendFrame();
      };
    })
    .catch((err) => {
      video.style.display = "none";
    });
}

/**
 * send current frame to server
 */
const sendFrame = () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  socket.emit("frame", canvas.toDataURL());
  setTimeout(sendFrame, 500);
};

const draw = () => {
  const people = document.getElementsByTagName("img");

  for (let i = 0; i < people.length; i++) {
    const lastLeft = +people[i].style.left.split("px")[0];
    const lastTop = +people[i].style.top.split("px")[0];

    if (lastLeft + 200 > window.innerWidth) {
      people[i].dirX = -1;
      changeFilter(people[i]);
    }
    if (lastLeft < 0) {
      people[i].dirX = 1;
      changeFilter(people[i]);
    }
    if (lastTop + 150 > window.innerHeight) {
      people[i].dirY = -1;
      changeFilter(people[i]);
    }
    if (lastTop < 0) {
      people[i].dirY = 1;
      changeFilter(people[i]);
    }
    people[i].style.left = lastLeft + people[i].dirX * people[i].speed + "px";
    people[i].style.top = lastTop + people[i].dirY * people[i].speed + "px";
  }

  requestAnimationFrame(draw);
};

const changeFilter = (element) => {
  const deg = Math.floor(Math.random() * 360);
  element.style.filter = `hue-rotate(${deg}deg)`;
};

/**
 * start finding webcam until one is attached
 */
const getVideoInterval = setInterval(() => {
  start();
}, 1000);

/**
 * received a frame
 */
socket.on("frame", function (data) {
  const frame = document.getElementById(data.id);

  if (frame) {
    frame.src = data.frame;
  } else {
    const frame = new Image();
    frame.src = data.frame;
    frame.setAttribute("id", data.id);
    frame.setAttribute("class", "people");
    frame.speed = Math.random() * 3 + 1;
    frame.dirX = [-1, 1][Math.floor(Math.random() * 2)];
    frame.dirY = [-1, 1][Math.floor(Math.random() * 2)];
    frame.style.top = Math.random() * (window.innerHeight - 150) + "px";
    frame.style.left = Math.random() * (window.innerWidth - 200) + "px";
    changeFilter(frame);
    document.body.appendChild(frame);
  }

  //document.getElementById("myimage").src = data;
});
