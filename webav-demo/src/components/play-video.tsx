import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import videoUrl from "@/assets/video.mp4";
import { MP4Clip } from "@webav/av-cliper";
import { useEffect, useRef, useState } from "react";
import { clamp } from "lodash-es";

function PlayVideo() {
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const clipRef = useRef<MP4Clip | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioStartAtRef = useRef(0);
  const isTickingRef = useRef(false);

  const handlePlayClick = async () => {
    if (!clipRef.current) {
      setIsPending(true);
      const videoRes = await fetch(videoUrl);
      clipRef.current = new MP4Clip(videoRes.body!);
      await clipRef.current.ready;

      const { duration, width, height } = clipRef.current.meta;
      canvasRef.current!.width = width;
      canvasRef.current!.height = height;

      setDuration(duration / 1e6);
      setIsPending(false);
      setCurTime(0);
    }

    if (isPlaying) {
      cancelAnimationFrame(timerRef.current!);
      timerRef.current = null;
    } else {
      let startTimestamp: DOMHighResTimeStamp = -1;

      const fn = (timestamp: DOMHighResTimeStamp) => {
        startTimestamp = startTimestamp === -1 ? timestamp : startTimestamp;
        const delta = timestamp - startTimestamp;
        startTimestamp = timestamp;
        setCurTime(curTime => curTime + delta / 1000);
        timerRef.current = requestAnimationFrame(fn);
      };

      timerRef.current = requestAnimationFrame(fn);
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!clipRef.current || !canvasRef.current) {
      return;
    }

    (async () => {
      if (isTickingRef.current) {
        return;
      }

      try {
        isTickingRef.current = true;
        const { video, audio, state } = await clipRef.current!.tick(curTime * 1e6);
        if (state === "done") {
          setCurTime(0);
          setIsPlaying(false);
          return;
        }

        if (video) {
          const ctx = canvasRef.current!.getContext("2d")!;
          ctx.drawImage(video, 0, 0);
          video.close();
        }

        const len = audio[0]?.length ?? 0;
        if (len > 0) {
          audioCtxRef.current = audioCtxRef.current || new AudioContext();
          const buf = audioCtxRef.current.createBuffer(2, len, 48000);
          buf.copyToChannel(audio[0], 0);
          buf.copyToChannel(audio[1], 1);
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buf;
          source.connect(audioCtxRef.current.destination);
          audioStartAtRef.current = Math.max(audioStartAtRef.current, audioCtxRef.current.currentTime);
          source.start(audioStartAtRef.current);
          audioStartAtRef.current += buf.duration;
        }
      } finally {
        isTickingRef.current = false;
      }
    })();
  }, [curTime, duration]);

  const progress = clamp(Math.round((curTime / duration) * 100), 0, 100);

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <Button disabled={isPending} onClick={handlePlayClick}>
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <canvas className="w-1/3 my-6" ref={canvasRef} />
      <div className="w-72 mt-6">
        <Progress value={progress} />
      </div>
    </div>
  );
}

export default PlayVideo;
