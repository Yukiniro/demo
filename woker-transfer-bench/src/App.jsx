import { useState } from "react";
import "./App.css";
import { Bench } from "tinybench";

const bench = new Bench({ iterations: 500 });

const App = () => {
  const [isRunning, setIsRunning] = useState(false);

  const start = async () => {
    if (isRunning) return;
    try {
      setIsRunning(true);
      const workerBuffer = new Worker(new URL("./worker/worker-buffer.js", import.meta.url));
      const workerBlob = new Worker(new URL("./worker/worker-blob.js", import.meta.url));
      bench
        .add("worker-buffer", async () => {
          workerBuffer.postMessage({ type: "start" });
          await new Promise((resolve, reject) => {
            workerBuffer.onmessage = e => {
              const buffer = e.data.data;
              resolve(new Blob([buffer]));
            };
            workerBuffer.onerror = reject;
          });
        })
        .add("worker-blob", async () => {
          workerBlob.postMessage({ type: "start" });
          await new Promise((resolve, reject) => {
            workerBlob.onmessage = e => {
              const blob = e.data.data;
              resolve(blob);
            };
            workerBlob.onerror = reject;
          });
        });

      await bench.warmup();
      await bench.run();
      console.table(bench.table());
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="content">
      <h2>Benchmark Worker Transfer</h2>
      <div>
        <button onClick={start} disabled={isRunning}>
          Start
        </button>
        {isRunning && <div className="loading">Running...</div>}
      </div>
    </div>
  );
};

export default App;
