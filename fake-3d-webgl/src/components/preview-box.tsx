import { useRef, useEffect } from "react";
import { bindCanvas } from "../store/app-store";
import { useTextureStore } from "../store/use-texture-store";
import { useToolsStore } from "../store/use-tools-store";

function PreviewBox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const updateViewSize = useTextureStore(state => state.updateViewSize);
  const depthMapImageUrl = useTextureStore(state => state.depthMapImageUrl);
  const depthMapOpacity = useToolsStore(state => state.depthMapOpacity);

  useEffect(() => {
    if (!canvasRef.current) return;
    bindCanvas(canvasRef.current);
  }, []);

  useEffect(() => {
    if (!canvasBoxRef.current) return;
    const { width, height } = canvasBoxRef.current.getBoundingClientRect();
    updateViewSize(width, height);
  }, [updateViewSize]);

  return (
    <div ref={canvasBoxRef} className="flex items-center justify-center w-[calc(100%-400px)] h-full absolute left-0">
      <div className="relative">
        <canvas ref={canvasRef} />
        {depthMapImageUrl && (
          <img src={depthMapImageUrl} style={{ opacity: depthMapOpacity / 100 }} className="absolute top-0 left-0" />
        )}
      </div>
    </div>
  );
}

export default PreviewBox;
