// script.js

const socket = io.connect();

// get canvas and set width and height
const canvas = document.getElementById("gameWindow");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// form submit
const sendmessage = (message) => {
  me.msg = message;
  socket.emit("chat", message);
  document.getElementById("message").value = "";
};

const form = document.getElementById("chatForm");
form.addEventListener("submit", (event) => {
  sendmessage(document.getElementById("message").value);
  event.preventDefault();
});

const ctx = canvas.getContext("2d");
// for better image smooth quality
ctx.imageSmoothingQuality = "high";

const characters = [
  "elephant",
  "giraffe",
  "hippo",
  "monkey",
  "panda",
  "parrot",
  "penguin",
  "pig",
  "rabbit",
  "snake",
];

const keyState = {};

let planetImage;
let angle = 0;
let myId;
let msg = "";

let me;
let friends = [];

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

const drawImage = (image, x, y, angle, scale, msg) => {
  const w = scale ? image.width * scale : image.width;
  const h = scale ? image.height * scale : image.height;
  const chatW = 75;
  const chatH = 25;

  ctx.font = "20px Arial";
  const msgW = ctx.measureText(msg).width / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.PI / 180) * angle);
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  if (msg) {
    ctx.save();
    ctx.translate(0, -160);
    ctx.beginPath();
    ctx.moveTo(chatW, chatH);
    ctx.quadraticCurveTo(chatW - msgW - 20, 25, chatW - msgW - 20, 62.5);
    ctx.quadraticCurveTo(chatW - msgW - 20, 100, 50, 100);
    ctx.quadraticCurveTo(50, 120, 30, 125);
    ctx.quadraticCurveTo(60, 120, 65, 100);
    ctx.quadraticCurveTo(chatW + msgW + 20, 100, chatW + msgW + 20, 62.5);
    ctx.quadraticCurveTo(chatW + msgW + 20, chatH, chatW, chatH);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(msg, chatW - msgW, 70);
    ctx.restore();
  }
  ctx.restore();
};

/*
 * move myself - make sure that angle is always in the range of [0, 360]
 * @param offset
 */
const move = (offset) => {
  angle += offset;

  if (angle > 360) angle -= 360;
  if (angle < 0) angle += 360;
  me.angle = angle;

  socket.emit("move", angle);
};

class Character {
  constructor(character, angle, id, msg) {
    return (async () => {
      this.id = id;
      this.image = await loadImage(`assets/characters/${character}.png`);
      this.angle = angle || 0;
      this.msg = msg;
      return this;
    })();
  }

  draw() {
    // @different angle
    const angleOffset = angle - this.angle;
    const r = planetImage.width / 2;

    // calculate characters position and draw
    const x = r * Math.sin((angleOffset * Math.PI) / 180);
    const y = r * (1 - Math.cos((angleOffset * Math.PI) / 180));
    drawImage(this.image, x, y, angleOffset, 0.2, this.msg);
  }
}

const setup = async () => {
  planetImage = await loadImage(
    "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fplanet.png?v=1601198911443"
  );

  const character = characters[Math.floor(Math.random() * characters.length)];
  angle = Math.floor(Math.random() * 360);
  msg = "";
  me = await new Character(character, angle, 0, msg);

  socket.emit("join", { character, angle });
};

const draw = () => {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Show online people
  ctx.textAlign = "right";
  ctx.font = "30px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Online: ${friends.length + 1}`, canvas.width - 40, 60);

  // Show location (angle)
  ctx.textAlign = "left";
  ctx.fillText(
    `Your location: ${angle % 1 === 0 ? angle + ".0" : angle}°`,
    40,
    60
  );

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  drawImage(planetImage, 0, 660, angle);

  friends.map((e) => e.draw());
  me.draw();

  if (keyState["ArrowLeft"]) {
    move(0.5);
  }
  if (keyState["ArrowRight"]) {
    move(-0.5);
  }

  ctx.restore();
  window.requestAnimationFrame(draw);
};

window.addEventListener("keydown", (event) => {
  keyState[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keyState[event.key] = false;
});

/*
 * main
 * setup and start drawing
 */
setup().then(draw);

const initFriends = async (people) => {
  friends = [];

  people
    .filter((e) => e.id !== myId)
    .forEach(async (person) => {
      friends.push(
        await new Character(
          person.character,
          person.angle,
          person.id,
          person.msg
        )
      );
    });
};

socket.on("login", (data) => {
  myId = data.myId;
  initFriends(data.people);
});

socket.on("join", async (person) => {
  friends.push(
    await new Character(person.character, person.angle, person.id, person.msg)
  );
});

socket.on("move", (data) => {
  const index = friends.findIndex((e) => e.id === data.id);
  if (index > -1) {
    friends[index].angle = data.angle;
  }
});

socket.on("chat", (data) => {
  const index = friends.findIndex((e) => e.id === data.id);
  if (index > -1) {
    friends[index].msg = data.msg;
  }
});

socket.on("quit", (id) => {
  const index = friends.findIndex((e) => e.id === id);
  if (index > -1) {
    friends.splice(index, 1);
  }
});
