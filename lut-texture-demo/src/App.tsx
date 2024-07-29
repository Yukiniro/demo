/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useRef } from "react";
import lutUrl from "./assets/vertopal.com_LD - Cashmere 1.png";
import { renderWithLutTexture } from "./util";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lutTextureRef = useRef<HTMLImageElement>(null);
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

    const fn = () => {
      if (!videoRef.current || !canvasRef.current || !lutTextureRef.current) {
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const lutTexture = lutTextureRef.current;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const lutCanvas = renderWithLutTexture(video, lutTexture, { width: canvas.width, height: canvas.height });
      ctx.drawImage(lutCanvas, 0, 0, canvas.width, canvas.height);

      requestAnimationFrame(fn);
    };

    requestAnimationFrame(fn);
  };

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-12">Lut Texture</h1>
      <input type="file" onChange={handleFileChange} />
      <div className="w-full flex">
        <img ref={lutTextureRef} src={lutUrl} className="w-48 h-48" />
        <video ref={videoRef} className="w-1/2" src={videoUrl} onLoadedData={handleVidoeLoaded} loop />
        <canvas ref={canvasRef} className="w-1/2" />
      </div>
    </div>
  );
}

export default App;
