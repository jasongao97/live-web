// Express is a node module for building HTTP servers
var express = require("express");
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static("public"));

// If the user just goes to the "route" / then run this function
app.get("/", function (req, res) {
  res.send("Hello World!");
});

// Here is the actual HTTP server
var http = require("http");
// We pass in the Express object
var httpServer = http.createServer(app);
// Listen on port 80
httpServer.listen(8080);

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require("socket.io").listen(httpServer);

const people = [];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  "connection",
  // We are given a websocket object in our function
  function (socket) {
    socket.emit("login", { myId: socket.id, people });

    // client join
    socket.on("join", function (data) {
      const { angle, character } = data;

      const person = {
        id: socket.id,
        angle,
        character,
      };
      people.push(person);
      console.log(person.character + " joined the chat.");

      socket.broadcast.emit("join", person);
    });

    // character move
    socket.on("move", function (angle) {
      const index = people.findIndex((e) => e.id === socket.id);
      if (index > -1) {
        people[index].angle = angle;
      }

      socket.broadcast.emit("move", { id: socket.id, angle });
    });

    // client disconnect
    socket.on("disconnect", function () {
      const index = people.findIndex((e) => e.id === socket.id);
      if (index > -1) {
        console.log(people[index].character + " left.");
        people.splice(index, 1);
      }

      socket.broadcast.emit("quit", socket.id);
    });
  }
);
