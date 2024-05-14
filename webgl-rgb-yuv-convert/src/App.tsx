/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useRef } from "react";

function App() {
  const rgbCanvasRef = useRef<HTMLCanvasElement>(null);
  const yuvCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const imageBitmap = await createImageBitmap(file);
    const { width, height } = imageBitmap;

    const rgbCanvas = rgbCanvasRef.current;
    if (rgbCanvas) {
      rgbCanvas.width = width;
      rgbCanvas.height = height;
      const rgbContext = rgbCanvas.getContext("2d");
      rgbContext?.drawImage(imageBitmap, 0, 0);
    }

    const worker = new Worker(new URL("./worker/yuv-converter.ts", import.meta.url));
    worker.postMessage({ type: "rgb2yuv", data: { data: imageBitmap } }, [imageBitmap]);
    worker.onmessage = async event => {
      const { type, data } = event.data;
      if (type === "rgb2yuv") {
        const yuvVideoFrame = new VideoFrame(data, {
          timestamp: 0,
          format: "I420",
          codedWidth: width,
          codedHeight: height,
        });

        const yuvCanvas = yuvCanvasRef.current;
        if (yuvCanvas) {
          yuvCanvas.width = width;
          yuvCanvas.height = height;
          const yuvContext = yuvCanvas.getContext("2d");
          yuvContext?.drawImage(yuvVideoFrame, 0, 0);
          yuvVideoFrame.close();
        }
      }
    };
  };

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-12">RGB to YUV</h1>
      <input type="file" onChange={handleFileChange} />
      <div className="w-full flex">
        <canvas ref={rgbCanvasRef} className="w-1/2" />
        <canvas ref={yuvCanvasRef} className="w-1/2" />
      </div>
    </div>
  );
}

export default App;
