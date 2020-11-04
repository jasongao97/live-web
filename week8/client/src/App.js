import { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";
import "./App.css";
import Recorder from "./components/Recorder";
import Sequencer from "./components/Sequencer";

function App() {
  const socket = useRef(null);
  const [step, setStep] = useState(0);
  const [loops, setLoops] = useState([]);

  const handleNewRecord = (res) => {
    socket.current.emit("newLoop", res.blob);
    // setUrls(urls.concat(res.url));
  };

  const toggleStep = (step, loopIndex) => {
    socket.current.emit("toggleLoop", {
      name: loops[loopIndex].name,
      step,
    });
  };

  const play = (index) => {
    const loops = document.getElementsByClassName("loop");
    if (loops.length) {
      loops[index].pause();
      loops[index].currentTime = 0;
      loops[index].play();
    }
  };

  useEffect(() => {
    loops.forEach((loop, index) => {
      if (loop.steps[step] === 1) play(index);
    });
    // next step change
    setTimeout(() => {
      if (step === 15) {
        setStep(0);
      } else {
        setStep(step + 1);
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    socket.current = socketIOClient('http://127.0.0.1:8080');
    socket.current.on("allLoops", (loops) => {
      console.log(loops);
      setLoops(loops);
    });
    socket.current.on("newLoop", (loop) => {
      setLoops((loops) => loops.concat(loop));
    });
    socket.current.on("toggleLoop", ({ name, steps }) => {
      setLoops((loops) =>
        loops.map((loop) => {
          if (loop.name === name) loop.steps = steps;
          return loop;
        })
      );
    });
  }, []);

  return (
    <div className="App">
      <div className="recorder">
        <Recorder onNewRecord={handleNewRecord} />
      </div>
      <div className="sequencer">
        {loops.length ? loops.map((loop, index) => (
          <div key={index} className="line">
            <video
              className="loop"
              src={loop.url}
              height="60"
              width="60"
            ></video>
            <Sequencer
              steps={loop.steps}
              current={step}
              onToggle={(step) => toggleStep(step, index)}
              color={loop.color}
            />
          </div>
        )) : 'Record & add your first loop'}
      </div>
    </div>
  );
}

export default App;
