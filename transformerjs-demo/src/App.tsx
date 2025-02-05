import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputFile from "@/components/input-file";

function App() {
  const worker = useRef<Worker | null>(null);
  const [disabled, setDisabled] = useState(false);

  // Inputs and outputs
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startLoadModelTime, setStartLoadModelTime] = useState(0);
  const [endLoadModelTime, setEndLoadModelTime] = useState(0);

  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("./worker/index.ts", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent) => {
      switch (e.data.type) {
        case "removeBG":
          {
            setEndTime(performance.now());
            const bitmap = e.data.data;
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
            const url = canvas.toDataURL();
            setOutput(url);
            setPending(false);
          }
          break;
        case "progress": {
          console.log("progress", e.data.data);
          break;
        }
        case "done": {
          setEndLoadModelTime(performance.now());
          setStartTime(performance.now());
          setEndTime(performance.now());
          break;
        }
        default:
          console.log("default", e.data);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current?.removeEventListener("message", onMessageReceived);
  });

  const removeBG = () => {
    setDisabled(true);
    setPending(true);
    setStartTime(performance.now());
    setEndTime(performance.now());
    setStartLoadModelTime(performance.now());
    setEndLoadModelTime(performance.now());
    worker.current?.postMessage({ type: "removeBG", url: input });
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(URL.createObjectURL(file));
    }
  };

  const pendingTime = endTime - startTime;
  const loadModelTime = endLoadModelTime - startLoadModelTime;

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Transformers.js</h1>
          <h2 className="text-xl text-muted-foreground">ML-powered multilingual translation in React!</h2>
        </div>
        <Card className="w-full max-w-6xl">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-full h-96 aspect-auto bg-muted rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
                {input ? (
                  <img src={input} alt="Original" className="max-w-full max-h-full object-contain" />
                ) : (
                  <InputFile onChange={handleInputFileChange} />
                )}
              </div>
              <div className="w-full h-96 aspect-auto bg-muted rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
                {output ? (
                  <img src={output} alt="Processed" className="max-w-full max-h-full object-contain" />
                ) : (
                  <p className="text-muted-foreground">处理后的图片将显示在这里</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Button disabled={disabled} onClick={removeBG} className="w-32">
          移除背景
        </Button>
        {pending && (
          <div>
            <p className="text-muted-foreground">正在处理中...</p>
          </div>
        )}
        {loadModelTime > 0 && (
          <p className="text-muted-foreground">加载模型时间: {(loadModelTime / 1e3).toFixed(2)}s</p>
        )}
        {pendingTime > 0 && <p className="text-muted-foreground">处理时间: {(pendingTime / 1e3).toFixed(2)}s</p>}
      </div>
    </>
  );
}

export default App;
