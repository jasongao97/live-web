const submitButton = document.getElementById("submit-button");
const message = document.getElementById("message");

const socket = io.connect();

let bubbles = []

socket.on("connect", function () {
  console.log("Connected");
});

// Receive from any event
socket.on("chatmessage", function (data) {

  bubbles.push(new Bubble(data, false))
});

const sendmessage = function (message) {
  socket.emit("chatmessage", message);
};

submitButton.addEventListener("click", function (event) {
  const { value } = message;

  bubbles.push(new Bubble(value, true))
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
  constructor(name, self) {
    this.diameter = textWidth(name) + 10;

    // self-created bubbles start from the center
    if (self) {
      this.x = width / 2;
      this.y = height / 2;
    } else {
      this.x = random(this.diameter, width - this.diameter);
      this.y = random(this.diameter, height - this.diameter);
    }
    
    this.speedx = random(-2, 2);
    this.speedy = random(-2, 2);
    this.hue = random(0, 100);
    this.name = name
  }

  move() {
    if (this.x >= width - this.diameter / 2 || this.x <= this.diameter / 2) this.speedx = -this.speedx
    if (this.y >= height - this.diameter / 2 || this.y <= this.diameter / 2) this.speedy = -this.speedy
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
