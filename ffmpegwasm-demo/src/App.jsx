import { useState, useRef, useEffect } from "react";
import { fetchFile } from "@ffmpeg/util";
import useFFmpeg from "./hooks/useFFmpeg";
import "./App.css";

const App = () => {
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const videoRef = useRef(null);
  const { data: ffmpeg, loading, error } = useFFmpeg();

  useEffect(() => {
    if (!ffmpeg) return;
    const fn = ({ message }) => {
      setMessage(message);
    };
    ffmpeg.on("log", fn);
    return () => {
      ffmpeg.off("log", fn);
    };
  }, [ffmpeg]);

  const handleGo = async () => {
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    const keywords = command.split(/\s+/);
    await ffmpeg.exec(keywords);
    const data = await ffmpeg.readFile(keywords[keywords.length - 1]);
    videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
  };

  if (loading) return <div>Loading ffmpeg...</div>;
  if (error) return <div>Error loading ffmpeg: {error.message}</div>;
  return (
    <div className="App">
      <h1>FFmpeg WebAssembly</h1>
      <input
        type="file"
        onChange={e => {
          const file = e.target.files[0];
          setFile(file);
          setCommand(`-i ${file.name}`);
        }}
      />
      <div>
        <textarea value={command} onChange={e => setCommand(e.target.value)} />
      </div>
      <button onClick={handleGo}>Go!</button>
      <p>{message}</p>
      <video ref={videoRef} controls />
    </div>
  );
};

export default App;
