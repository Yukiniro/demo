import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [checked, setChecked] = useState(true);

  const playWithImageDecoder = async (file: File) => {
    const parseStartTimestamp = performance.now();
    const response = await fetch(URL.createObjectURL(file));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const decoder = new ImageDecoder({
      type: "image/gif",
      data: response.body,
    });

    await decoder.completed;
    await decoder.tracks.ready;
    const frameCount = decoder.tracks.selectedTrack.frameCount;
    const frames: VideoFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      frames.push(result.image);
    }
    const parseEndTimestamp = performance.now();
    console.log(`Parse time: ${parseEndTimestamp - parseStartTimestamp}ms`);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = frames[0].displayWidth;
      canvas.height = frames[0].displayHeight;
    }

    let startTime = 0;
    const renderFrame = (timestamp: number) => {
      startTime = startTime || timestamp;
      const time = timestamp - startTime;
      const frameIndex = Math.floor(time / 100) % frames.length;
      const frame = frames[frameIndex];
      const ctx = canvas!.getContext("2d");
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.drawImage(frame, 0, 0);
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  };

  const playWithGifuct = async (file: File) => {
    const parseStartTimestamp = performance.now();
    const response = await fetch(URL.createObjectURL(file));
    const arrayBuffer = await response.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const frames: OffscreenCanvas[] = decompressFrames(gif, true).map(currentFrame => {
      const offscreenCanvas = new OffscreenCanvas(gif.lsd.width, gif.lsd.height);
      const ctx = offscreenCanvas.getContext("2d");
      if (ctx) {
        const { width, height, left, top } = currentFrame.dims;
        ctx.putImageData(new ImageData(currentFrame.patch, width, height), left, top);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      offscreenCanvas.disposalType = currentFrame.disposalType;
      return offscreenCanvas;
    });
    const parseEndTimestamp = performance.now();
    console.log(`Parse time: ${parseEndTimestamp - parseStartTimestamp}ms`);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = gif.lsd.width;
      canvas.height = gif.lsd.height;
    }

    let startTime = 0;
    let preIndex = -1;

    const renderFrame = (timestamp: number) => {
      startTime = startTime || timestamp;
      const time = timestamp - startTime;
      const frameIndex = Math.floor(time / 100) % frames.length;

      if (frameIndex === preIndex) {
        requestAnimationFrame(renderFrame);
        return;
      }

      preIndex = frameIndex;

      const frame = frames[frameIndex];
      const ctx = canvas!.getContext("2d");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (frameIndex === 0 || frames[frameIndex - 1].disposalType === 2) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }

      ctx!.drawImage(frame, 0, 0);
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (checked) {
        await playWithImageDecoder(file);
      } else {
        await playWithGifuct(file);
      }
    }
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32 fixed top-6">GIF</h1>
      <div className="flex flex-col w-full max-w-sm items-center justify-center gap-1.5">
        <Input type="file" accept="image/gif" onChange={handleFileChange} />
        <canvas ref={canvasRef} />
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" checked={checked} onCheckedChange={setChecked} />
              <Label htmlFor="airplane-mode">WebCodecs</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
