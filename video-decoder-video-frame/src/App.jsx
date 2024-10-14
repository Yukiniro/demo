import "./App.css";
import videoUrl from './assets/bunny.mp4';
import MP4Box from 'mp4box'
import { parseVideoCodecDesc, sleep } from "./util";
import { useRef } from "react";

const App = () => {

  const canvasRef = useRef(null);

  const decodeVideo = async () => {
    const mp4box = MP4Box.createFile();

    let videoInfo = null;
    const videoSamples = [];
    const videoFrames = [];

    const decodeVideo = async videoSamples => {
      const videoDecoder = new VideoDecoder({
        error: (e) => {
          console.error(e);
        },
        output: (vf) => {
          videoFrames.push(vf);
          canvasRef.current.width = vf.displayWidth;
          canvasRef.current.height = vf.displayHeight;
          canvasRef.current.getContext("2d").drawImage(vf, 0, 0);
          vf.close();
        },
      });

      const { track_width, track_height, codec, timescale, id } =
        videoInfo.videoTracks[0];
      const desc = parseVideoCodecDesc(mp4box.getTrackById(id)).buffer;

      const videoConfig = {
        codedWidth: track_width,
        codedHeight: track_height,
        description: desc,
        codec,
      };
      await VideoDecoder.isConfigSupported(videoConfig);
      videoDecoder.configure(videoConfig);

      const delta = videoSamples[0].dts;
      while (videoSamples.length > 0) {
        if (videoDecoder.decodeQueueSize > 20) {
          await sleep(50);
          continue;
        }
        const sample = videoSamples.shift();
        const chunk = new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: ((sample.cts - delta) / timescale) * 1e6,
          duration: (sample.duration / timescale) * 1e6,
          data: sample.data,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          transfer: [sample.data.buffer],
        });
        videoDecoder.decode(chunk);
      }
    };

    mp4box.onError = (e) => {
      console.error(e);
    };
    mp4box.onReady = info => {
      console.log("mp4box ready", info);
      videoInfo = info;
      const videoTrack = info.videoTracks[0];
      mp4box.setExtractionOptions(videoTrack.id);
      mp4box.start();
    };
    mp4box.onSamples = (id, user, samples) => {
      videoSamples.push(...samples);
      if (videoSamples.length === videoInfo.videoTracks[0].nb_samples) {
        decodeVideo(videoSamples);
      }
    };

    fetch(videoUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        buffer.fileStart = 0;
        mp4box.appendBuffer(buffer);
      })
      .finally(() => {
        mp4box.flush();
      });
  };

  return (
    <div className="content">
      <h2>VideoFrame Issue</h2>
      <div>
        <button onClick={decodeVideo}>Decode</button>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default App;
