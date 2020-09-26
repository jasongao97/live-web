let planetImage;
let angle = 0;

let me;
let friends = [];

function preload() {
  planetImage = loadImage("assets/planet.png");

  me = new Character("penguin");
  friends = [
    new Character("parrot", 20),
    new Character("giraffe", -30)
  ]
}

function setup() {
  // create the canvas to be the full size of the window
  createCanvas(innerWidth, innerHeight);

  background(0);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  drawPlanet();
  friends.map(e => e.draw())
  me.draw();

  // Arrow Keys or WASD to move
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    angle += .5;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    angle -= .5;
  }

  // always sync with global angle
  me.angle = angle;
}

function drawPlanet() {
  translate(0, 660);
  rotate((PI / 180) * angle);
  imageMode(CENTER);
  image(planetImage, 0, 0, 1200, 1200);
  rotate(-(PI / 180) * angle);
  translate(0, -660);
}

class Character {
  constructor(avatar, angle) {
    this.image = loadImage(`assets/characters/${avatar}.png`);
    this.angle = angle || 0;
  }

  // draw character @ different angle
  draw() {
    translate(0, 660);
    rotate((PI / 180) * (angle - this.angle));
    image(this.image, 0, -610, 60, 60);
    rotate(-(PI / 180) * (angle - this.angle));
    translate(0, -660);
  }
}
