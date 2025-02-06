import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputFile from "@/components/input-file";

export default function ViewRMBG() {
  const worker = useRef<Worker | null>(null);

  const [prepareModelTime, setPrepareModelTime] = useState(0);
  const [pendingTime, setPendingTime] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    worker.current = new Worker(new URL("../worker/rmbg.ts", import.meta.url), {
      type: "module",
    });
    return () => worker.current?.terminate();
  }, []);

  const prepareModel = async () => {
    setPending(true);
    const timestamp = performance.now();
    await new Promise(resolve => {
      const fn = (e: MessageEvent) => {
        if (e.data.type === "done") {
          worker.current?.removeEventListener("message", fn);
          resolve(e.data);
        } else if (e.data.type === "progress") {
          console.log("progress", e.data.data);
        }
      };
      worker.current?.addEventListener("message", fn);
      worker.current?.postMessage({ type: "prepareModel" });
    });
    setPrepareModelTime(performance.now() - timestamp);
    setIsModelReady(true);
    setPending(false);
  };

  const removeBG = async () => {
    setPending(true);
    const timestamp = performance.now();
    const url = await new Promise(resolve => {
      worker.current?.addEventListener("message", e => {
        switch (e.data.type) {
          case "removeBG":
            {
              const bitmap = e.data.data;
              const canvas = document.createElement("canvas");
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
              const url = canvas.toDataURL();
              resolve(url);
            }
            break;
          default:
            break;
        }
      });
      worker.current?.postMessage({ type: "removeBG", url: input });
    });
    setPendingTime(performance.now() - timestamp);
    setOutput(url as string);
    setPending(false);
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(URL.createObjectURL(file));
    }
  };

  const prepareModelTimeText = prepareModelTime === 0 ? "NaN" : (prepareModelTime / 1e3).toFixed(2);
  const pendingTimeText = pendingTime === 0 ? "NaN" : (pendingTime / 1e3).toFixed(2);

  return (
    <>
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
      {!isModelReady && (
        <Button disabled={pending} onClick={prepareModel} className="w-32">
          准备模型
        </Button>
      )}
      {isModelReady && (
        <Button disabled={pending} onClick={removeBG} className="w-32">
          移除背景
        </Button>
      )}
      <p className="text-muted-foreground">加载模型时间: {prepareModelTimeText}s</p>
      <p className="text-muted-foreground">处理时间: {pendingTimeText}s</p>
    </>
  );
}
