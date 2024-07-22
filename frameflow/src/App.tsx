import { Button } from "@/components/ui/button";
import videoUrl from "@/assets/video.mp4";
import fflow from "frameflow";
import { saveAs } from "file-saver";

function App() {
  const handleClick = async () => {
    const videoSource = await fflow.source(videoUrl);
    const blob = await videoSource.trim({ start: 1, duration: videoSource.duration }).exportTo(Blob);
    saveAs(blob, "trimmed-video.mp4");
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32">frameflow</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}

export default App;
