// filesystem
const fs = require("fs");

// Express is a node module for building HTTP servers
const express = require("express");
const app = express();

// Host static files
app.use(express.static("public"));

// If the user just goes to the "route" / then run this function
app.get("/", function (req, res) {
  res.send("Hello World!");
});

// Here is the actual HTTP server
const http = require("http");
// We pass in the Express object
const httpServer = http.createServer(app);
// Listen on port 8080
httpServer.listen(8080);

// WebSocket Portion
// WebSockets work with the HTTP server
const io = require("socket.io").listen(httpServer);

// pregenerated hues
const hues = [...Array(10)]
  .map((_, index) => 36 * index)
  .sort(() => 0.5 - Math.random());

const loops = [];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  "connection",
  // We are given a websocket object in our function
  function (socket) {
    console.log("We have a new client: " + socket.id);
    socket.emit("allLoops", loops)

    socket.on("newLoop", function (video) {
      const name = socket.id + "_" + Date.now();
      fs.writeFile(__dirname + "/public/loops/" + name + ".webm", video, function (err) {
        if (err) console.log(err);

        const hue = hues[loops.length % 10];
        const saturation = Math.floor(30 * Math.random()) + 50;
        const lightness = Math.floor(30 * Math.random()) + 50;

        const loop = {
          name,
          url: `http://127.0.0.1:8080/loops/${name}.webm`,
          color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          steps: [...Array(16)].map(_ => 0)
        }

        loops.push(loop);

        io.emit('newLoop', loop)
      });
    });

    socket.on("toggleLoop", function ({ name, step }) {
      const loop = loops.find(loop => loop.name === name);
      if (loop) {
        loop.steps[step] = loop.steps[step] === 1 ? 0 : 1;

        io.emit('toggleLoop', {
          name: loop.name,
          steps: loop.steps,
        })
      }
    })

    socket.on("disconnect", function () {
      console.log("Client has disconnected " + socket.id);
    });
  }
);
