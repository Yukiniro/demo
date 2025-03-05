import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    if (!video) return;
    video.src = url;
    video.load();
  };

  const handleExport = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const gif = new GIFEncoder();
    const preFrameTime = 1 / 30;
    const start = 2;
    const end = 3;
    let curTime = start;
    while (curTime <= end) {
      await new Promise(resolve => {
        const fn = () => {
          video.onseeked = null;
          resolve(null);
        };
        video.onseeked = fn;
        video.currentTime = curTime;
      });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      curTime += preFrameTime;
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantize(data, 256, { format: "rgba4444" });
      const index = applyPalette(data, palette, "rgba4444");
      gif.writeFrame(index, width, height, { palette, transparent: true, transparentIndex: 0 });
    }

    gif.finish();
    const output = gif.bytes();
    const blob = new Blob([output], { type: "image/gif" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.gif";
    a.click();
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32">Gif Encode Demo</h1>
      <div className="flex items-center gap-2">
        <Input type="file" accept="video/webm" onChange={handleFileChange} />
        <Button onClick={handleExport}>Export</Button>
      </div>
      <video className="w-[640px]" ref={videoRef} />
    </div>
  );
}

export default App;
