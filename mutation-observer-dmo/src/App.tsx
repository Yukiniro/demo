/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import fastdom from "fastdom";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
  };

  const handleVidoeLoaded = () => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.play();

    const observer = new MutationObserver(mutationList => {
      mutationList.forEach(mutation => {
        fastdom.measure(() => {
          const rect = (mutation.target as HTMLElement).getBoundingClientRect();
          console.log(rect.x, rect.y, rect.width, rect.height);
        });
      });
    });

    observer.observe(videoRef.current, {
      attributes: true, // 观察属性变动
    });

    anime({
      targets: videoRef.current,
      rotate: 360,
      loop: true,
    });

    const fn = () => {
      if (!videoRef.current || !canvasRef.current) {
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      requestAnimationFrame(fn);
    };

    requestAnimationFrame(fn);
  };

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-12">Mutation Observer Demo</h1>
      <input type="file" onChange={handleFileChange} />
      <div className="w-full flex">
        <video ref={videoRef} className="w-1/2 " src={videoUrl} onLoadedData={handleVidoeLoaded} loop />
        <canvas ref={canvasRef} className="w-1/2" />
      </div>
    </div>
  );
}

export default App;
