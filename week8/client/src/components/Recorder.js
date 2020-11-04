import { useState, useEffect, useRef } from "react";
import styles from "./Recorder.module.css";

function Recorder({ onNewRecord }) {
  const mediaRecorder = useRef(null);
  const mediaChunks = useRef([]);
  const mediaStream = useRef(null);

  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState("");

  const getMediaStream = async () => {
    const constraints = { audio: true, video: { width: 320, height: 240 } };

    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        constraints
      );
      mediaStream.current = stream;
      const video = document.querySelector("#preview");
      video.srcObject = stream;
    } catch (error) {
      console.log(error.name + ": " + error.message);
    }
  };

  const startRecording = () => {
    mediaRecorder.current = new MediaRecorder(mediaStream.current);
    mediaRecorder.current.ondataavailable = onRecordingActive;
    mediaRecorder.current.onstop = onRecordingStop;

    setTimeout(() => {
      mediaRecorder.current.start();
      setTimeout(function () {
        mediaRecorder.current.stop();
      }, 1000);
    }, 100);
  };

  const cancelRecording = () => {
    setMediaBlobUrl("");
  };

  const uploadRecording = () => {
    onNewRecord({
      blob: mediaBlob,
      url: mediaBlobUrl,
    });
    setMediaBlobUrl("");
  };

  const onRecordingActive = ({ data }) => {
    mediaChunks.current.push(data);
  };

  const onRecordingStop = () => {
    const blobProperty = {
      type: "video/webm",
    };
    const blob = new Blob(mediaChunks.current, blobProperty);
    setMediaBlob(blob);
    const url = URL.createObjectURL(blob);
    setMediaBlobUrl(url);
    mediaChunks.current = [];
  };

  useEffect(() => {
    if (!mediaStream.current) {
      getMediaStream();
    }
  });
  return (
    <div className={styles.recorder}>
      <video
        style={{ display: mediaBlobUrl ? "none" : "block" }}
        id="preview"
        height="120"
        width="160"
        autoPlay
        muted
      ></video>
      <video
        style={{ display: mediaBlobUrl ? "block" : "none" }}
        src={mediaBlobUrl}
        height="120"
        width="160"
        autoPlay
        loop
      ></video>
      {mediaBlobUrl ? (
        <>
          <button className={styles.primaryButton} onClick={uploadRecording}>
            Add to sequencer
          </button>
          <button className={styles.secondaryButton} onClick={cancelRecording}>
            Cancel
          </button>
        </>
      ) : (
        <button className={styles.primaryButton} onClick={startRecording}>
          Record
        </button>
      )}
    </div>
  );
}

export default Recorder;
