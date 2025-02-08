import { Card, CardContent } from "@/components/ui/card";
import InputFile from "@/components/input-file";
import ModelControls from "@/components/model-controls";
import useModelState from "@/hooks/use-model-state";
import useModelWorker from "@/hooks/use-model-worker";
import { useRef, useState } from "react";
import { clamp } from "lodash-es";

let image: HTMLImageElement | null = null;

export default function ViewSAM({ device }: { device: "webgpu" | "wasm" }) {
  const [state, actions] = useModelState();
  const { prepareModelTime, pendingTime, isModelReady, input, pending } = state;
  const { setPrepareModelTime, setPendingTime, setIsModelReady, setInput, setPending } = actions;
  const worker = useModelWorker("../worker/sam.ts");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSegmented, setHasSegmented] = useState(false);

  const renderImage = () => {
    if (canvasRef.current && image) {
      canvasRef.current.width = image.naturalWidth;
      canvasRef.current.height = image.naturalHeight;
      const ctx = canvasRef.current.getContext("2d");
      ctx?.drawImage(image, 0, 0);
    }
  };

  const prepareModel = async () => {
    setPending(true);
    const timestamp = performance.now();
    await new Promise(resolve => {
      const fn = (e: MessageEvent) => {
        if (e.data.type === "done") {
          worker.current?.removeEventListener("message", fn);
          resolve(e.data);
        }
      };
      worker.current?.addEventListener("message", fn);
      worker.current?.postMessage({ type: "prepareModel", device });
    });
    setPrepareModelTime(performance.now() - timestamp);
    setIsModelReady(true);
    setPending(false);
  };

  const segmentImage = async () => {
    setPending(true);
    const timestamp = performance.now();
    await new Promise(resolve => {
      worker.current?.addEventListener("message", e => {
        if (e.data.type === "segment_result") {
          resolve(e.data);
        }
      });
      worker.current?.postMessage({ type: "segment", url: input });
    });
    setPendingTime(performance.now() - timestamp);
    setPending(false);
    setHasSegmented(true);
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(URL.createObjectURL(file));
      image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = renderImage;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
    const imageRect = e.currentTarget.getBoundingClientRect();
    const x = clamp((clientX - imageRect.left) / imageRect.width, 0, 1);
    const y = clamp((clientY - imageRect.top) / imageRect.height, 0, 1);
    const fn = (e: MessageEvent) => {
      if (e.data.type === "success") {
        const bitmap = e.data.data;
        renderImage();
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.save();
          ctx!.globalAlpha = 0.6;
          ctx?.drawImage(bitmap, 0, 0);
          ctx?.restore();
        }

        worker.current?.removeEventListener("message", fn);
      }
    };
    worker.current?.addEventListener("message", fn);
    worker.current?.postMessage({ type: "run", points: [[x, y]] });
  };

  return (
    <>
      <Card className="w-[500px]">
        <CardContent className="p-0">
          <div className="flex items-center justify-center">
            <div className="w-[500px h-96 aspect-auto bg-muted flex items-center justify-center">
              {input ? (
                <canvas ref={canvasRef} onClick={handleClick} className="max-w-full max-h-full object-contain" />
              ) : (
                <InputFile onChange={handleInputFileChange} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <ModelControls
        hideButton={hasSegmented}
        isModelReady={isModelReady}
        pending={pending}
        prepareModelTime={prepareModelTime}
        pendingTime={pendingTime}
        onPrepareModel={prepareModel}
        onGenerate={segmentImage}
      />
    </>
  );
}
