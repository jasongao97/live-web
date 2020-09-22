const submitButton = document.getElementById("submit-button");
const message = document.getElementById("message");

const socket = io.connect();

let bubbles = []

socket.on("connect", function () {
  console.log("Connected");
});

// Receive from any event
socket.on("chatmessage", function (data) {

  bubbles.push(new Bubble(data))
});

const sendmessage = function (message) {
  socket.emit("chatmessage", message);
};

submitButton.addEventListener("click", function (event) {
  const { value } = message;

  bubbles.push(new Bubble(value))
  sendmessage(value)
});

function setup() {
  // create the canvas to be the full size of the window
  createCanvas(innerWidth, innerHeight);

  background(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(30);
  colorMode(HSL, 100);
}

function draw() {
  background(255);
  bubbles.forEach(bubble => {
    bubble.move();
    bubble.display();
  })
}

class Bubble {
  constructor(name) {
    this.x = random(width);
    this.y = random(height);
    this.speedx = random(-2, 2);
    this.speedy = random(-2, 2);
    this.diameter = textWidth(name) + 10;
    this.hue = random(0, 100);
    this.name = name
  }

  move() {
    if (this.x >= width || this.x <= 0) this.speedx = -this.speedx
    if (this.y >= height || this.y <= 0) this.speedy = -this.speedy
    this.x += this.speedx;
    this.y += this.speedy;
  }

  display() {
    fill(this.hue, 50, 50);
    ellipse(this.x, this.y, this.diameter);

    fill(255);
    text(this.name, this.x, this.y);
  }
}
