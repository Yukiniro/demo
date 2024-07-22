import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import videoUrl from "@/assets/video.mp4";
import audioUrl from "@/assets/audio.mp3";
import { saveAs } from "file-saver";
import { MP4Clip, AudioClip, OffscreenSprite, Combinator } from "@webav/av-cliper";
import { useState } from "react";

function App() {
  const [progress, setProgress] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);
    setProgress(0);
    const videoRes = await fetch(videoUrl);
    const audioRes = await fetch(audioUrl);
    const videoClip = new MP4Clip(videoRes.body!);
    const audioClip = new AudioClip(audioRes.body!);
    const videoSprite = new OffscreenSprite(videoClip);
    const audioSprite = new OffscreenSprite(audioClip);
    await Promise.all([videoSprite.ready, audioSprite.ready]);

    const width = 1280;
    const height = 720;

    videoSprite.rect.w = width;
    videoSprite.rect.h = height;

    const com = new Combinator({ width, height });
    await com.addSprite(videoSprite, { main: true });
    await com.addSprite(audioSprite);

    com.on("OutputProgress", progress => setProgress(progress));
    com.on("error", err => alert(err.message));

    const outStream = com.output();
    const outBlob = await new Response(outStream).blob();
    saveAs(outBlob, "output.mp4");
    setIsPending(false);
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32">WebAV</h1>
      <Button disabled={isPending} onClick={handleClick}>
        Click me
      </Button>
      <div className="w-72 mt-6">
        <Progress value={Math.round(progress * 100)} />
      </div>
    </div>
  );
}

export default App;
