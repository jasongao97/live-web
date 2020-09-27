// script.js

const socket = io.connect();

// get canvas and set width and height
const canvas = document.getElementById("gameWindow");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

// const charactersImage = {
//   "elephant": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Felephant.png?v=1601141192796",
//   "giraffe": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fgiraffe.png?v=1601141192848",
//   "hippo": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fhippo.png?v=1601141192776",
//   "monkey": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fmonkey.png?v=1601141193282",
//   "panda": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fpanda.png?v=1601141194056",
//   "parrot": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fparrot.png?v=1601141192003",
//   "penguin": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fpenguin.png?v=1601141192024",
//   "pig": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fpig.png?v=1601141194514",
//   "rabbit": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Frabbit.png?v=1601141195097",
//   "snake": "https://cdn.glitch.com/c99d9875-2231-49d9-89bb-07e2a3d9845e%2Fsnake.png?v=1601141195813",
// }

const keyState = {};

let planetImage;
let angle = 0;
let myId;

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

const drawImage = (image, x, y, angle, scale) => {
  const w = scale ? image.width * scale : image.width;
  const h = scale ? image.height * scale : image.height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.PI / 180) * angle);
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
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
  constructor(avatar, angle, id) {
    return (async () => {
      this.id = id;
      this.image = await loadImage(`assets/characters/${avatar}.png`);
      this.angle = angle || 0;
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
    drawImage(this.image, x, y, angleOffset, 0.2);
  }
}

const setup = async () => {
  planetImage = await loadImage("assets/planet.png");

  const character = characters[Math.floor(Math.random() * characters.length)];
  angle = Math.floor(Math.random() * 360);
  me = await new Character(character, angle);

  socket.emit("join", { character, angle });
};

const draw = () => {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  drawImage(planetImage, 0, 660, angle);

  friends.map((e) => e.draw());
  me.draw();

  if (keyState["ArrowLeft"] || keyState["a"]) {
    move(0.5);
  }
  if (keyState["ArrowRight"] || keyState["d"]) {
    move(-0.5);
  }

  ctx.font = "30px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Current angle: ${angle}`, 0, -200);

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
        await new Character(person.character, person.angle, person.id)
      );
    });
};

socket.on("login", (data) => {
  myId = data.myId;
  initFriends(data.people);
});

socket.on("join", async (person) => {
  friends.push(
    await new Character(person.character, person.angle, person.id)
  )
});

socket.on("move", (data) => {
  const index = friends.findIndex((e) => e.id === data.id);
  if (index > -1) {
    friends[index].angle = data.angle;
  }
});

socket.on("quit", (id) => {
  const index = friends.findIndex((e) => e.id === id);
  if (index > -1) {
    friends.splice(index, 1);
  }
})
