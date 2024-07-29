import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const ffInstance = new FFmpeg();

export default function useFFmpeg() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchPromiseRef = useRef(null);
  const ffmpegRef = useRef(ffInstance);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpegRef.current.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  };

  useEffect(() => {
    if (!fetchPromiseRef.current) {
      fetchPromiseRef.current = load()
        .then(() => setData(ffmpegRef.current))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }
  }, []);

  return {
    data,
    loading,
    error,
  };
}
