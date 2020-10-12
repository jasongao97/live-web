let simplepeers = [];
var socket;
var mystream;

window.addEventListener("load", function () {
  // This kicks it off
  initCapture();
});

function initCapture() {
  console.log("initCapture");

  // The video element on the page to display the webcam
  let video = document.getElementById("myvideo");

  video.speed = Math.random() * 3 + 1;
  video.dirX = [-1, 1][Math.floor(Math.random() * 2)];
  video.dirY = [-1, 1][Math.floor(Math.random() * 2)];
  video.style.top = Math.random() * (window.innerHeight - 150) + "px";
  video.style.left = Math.random() * (window.innerWidth - 200) + "px";

  // Constraints - what do we want?
  let constraints = { audio: true, video: true };

  // Prompt the user for permission, get the stream
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      /* Use the stream */

      // Global object
      mystream = stream;

      // Attach to our video object
      video.srcObject = stream;

      // Wait for the stream to load enough to play
      video.onloadedmetadata = function (e) {
        video.play();
      };

      // Now setup socket
      setupSocket();
      draw();
    })
    .catch(function (err) {
      /* Handle the error */
      alert(err);
    });
}

function setupSocket() {
  socket = io.connect();

  socket.on("connect", function () {
    console.log("Socket Connected");
    console.log("My socket id: ", socket.id);

    // Tell the server we want a list of the other users
    socket.emit("list");
  });

  socket.on("disconnect", function (data) {
    console.log("Socket disconnected");
  });

  socket.on("peer_disconnect", function (data) {
    console.log("simplepeer has disconnected " + data);
    for (let i = 0; i < simplepeers.length; i++) {
      if (simplepeers[i].socket_id == data) {
        console.log("Removing simplepeer: " + i);
        simplepeers.splice(i, 1);
        // Should also remove video from page
      }
    }
  });

  // Receive listresults from server
  socket.on("listresults", function (data) {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      // Make sure it's not us
      if (data[i] != socket.id) {
        // create a new simplepeer and we'll be the "initiator"
        let simplepeer = new SimplePeerWrapper(true, data[i], socket, mystream);

        // Push into our array
        simplepeers.push(simplepeer);
      }
    }
  });

  socket.on("signal", function (to, from, data) {
    console.log("Got a signal from the server: ", to, from, data);

    // to should be us
    if (to != socket.id) {
      console.log("Socket IDs don't match");
    }

    // Look for the right simplepeer in our array
    let found = false;
    for (let i = 0; i < simplepeers.length; i++) {
      if (simplepeers[i].socket_id == from) {
        console.log("Found right object");
        // Give that simplepeer the signal
        simplepeers[i].inputsignal(data);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log("Never found right simplepeer object");
      // Let's create it then, we won't be the "initiator"
      let simplepeer = new SimplePeerWrapper(false, from, socket, mystream);

      // Push into our array
      simplepeers.push(simplepeer);

      // Tell the new simplepeer that signal
      simplepeer.inputsignal(data);
    }
  });
}

function draw() {
  const people = document.getElementsByTagName("video");

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
}

function changeFilter(element) {
  const deg = Math.floor(Math.random() * 360);
  element.style.filter = `hue-rotate(${deg}deg)`;
}

// A wrapper for simplepeer as we need a bit more than it provides
class SimplePeerWrapper {
  constructor(initiator, socket_id, socket, stream) {
    this.simplepeer = new SimplePeer({
      initiator: initiator,
      trickle: false,
    });

    // Their socket id, our unique id for them
    this.socket_id = socket_id;

    // Socket.io Socket
    this.socket = socket;

    // Our video stream - need getters and setters for this
    this.stream = stream;

    // simplepeer generates signals which need to be sent across socket
    this.simplepeer.on("signal", (data) => {
      this.socket.emit("signal", this.socket_id, this.socket.id, data);
    });

    // When we have a connection, send our stream
    this.simplepeer.on("connect", () => {
      console.log("CONNECT");
      console.log(this.simplepeer);
      //p.send('whatever' + Math.random())

      // Let's give them our stream
      this.simplepeer.addStream(stream);
      console.log("Send our stream");
    });

    // Stream coming in to us
    this.simplepeer.on("stream", (stream) => {
      console.log("Incoming Stream");

      // This should really be a callback
      // Create a video object
      let ovideo = document.createElement("VIDEO");
      ovideo.id = this.socket_id;
      ovideo.speed = Math.random() * 3 + 1;
      ovideo.dirX = [-1, 1][Math.floor(Math.random() * 2)];
      ovideo.dirY = [-1, 1][Math.floor(Math.random() * 2)];
      ovideo.style.top = Math.random() * (window.innerHeight - 150) + "px";
      ovideo.style.left = Math.random() * (window.innerWidth - 200) + "px";
      ovideo.srcObject = stream;
      ovideo.muted = true;
      ovideo.onloadedmetadata = function (e) {
        ovideo.play();
      };
      changeFilter(ovideo);
      document.body.appendChild(ovideo);
      console.log(ovideo);
    });
  }

  inputsignal(sig) {
    this.simplepeer.signal(sig);
  }
}
