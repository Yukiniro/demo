import { useEffect, useRef } from "react";
import "./App.css";
import videoUrl from "./assets/WebcamRecording-MadewithFlexClip.webm";

const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.onerror = e => {
      console.log(e);
      console.log(video.error);
      console.log(`seek failed, currentTime: ${video.currentTime}`);
    };
    video.onseeked = e => {
      console.log(video.currentTime);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      video.currentTime = video.currentTime + 1 / 30;
    };
    video.onloadeddata = () => {
      video.currentTime = 701;
    };
    video.src = videoUrl;

    return () => {
      video.onerror = null;
      video.onseeked = null;
      video.onloadeddata = null;
      video.src = null;
    };
  }, []);

  return (
    <div className="content">
      <h1>Video Seek Preview</h1>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default App;
