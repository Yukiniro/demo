import { useEffect, useRef, useState } from "react";
import { loadImage } from "./utils";
import useOnceEffect from "./hooks/useOnceEffect";
import SelectImage, { IMAGE_INFO } from "./components/SelectImage";
import { Slider } from "@douyinfe/semi-ui";
import { initRenderStore, updateResolution, updateTexture, render } from "./store/render-store";

const BASE_CANVAS_HEIGHT = 650;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDepthRef = useRef<HTMLCanvasElement>(null);

  const [originalImageUrl, setOriginalImageUrl] = useState(IMAGE_INFO[4].originalImageUrl);
  const [depthImageUrl, setDepthImageUrl] = useState(IMAGE_INFO[4].depthImageUrl);
  const [depthImageOpacity, setDepthImageOpacity] = useState(0);

  const handleChange = (originalImageUrl: string, depthImageUrl: string): void => {
    setOriginalImageUrl(originalImageUrl);
    setDepthImageUrl(depthImageUrl);
  };

  useOnceEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }
    initRenderStore(gl);

    (async () => {
      const image0 = await loadImage(originalImageUrl);
      const image1 = await loadImage(depthImageUrl);

      canvasDepthRef!.current!.height = BASE_CANVAS_HEIGHT;
      canvasDepthRef!.current!.width = (image1.width / image1.height) * BASE_CANVAS_HEIGHT;
      canvasDepthRef!
        .current!.getContext("2d")
        ?.drawImage(image1, 0, 0, canvasDepthRef!.current!.width, canvasDepthRef!.current!.height);

      canvas.height = BASE_CANVAS_HEIGHT;
      canvas.width = (image0.width / image0.height) * BASE_CANVAS_HEIGHT;

      updateResolution(canvas.width, canvas.height);
      updateTexture(image0, image1);

      render();
    })();
  }, []);

  useEffect(() => {
    if (!originalImageUrl || !depthImageUrl) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    (async () => {
      const image0 = await loadImage(originalImageUrl);
      const image1 = await loadImage(depthImageUrl);

      canvasDepthRef!.current!.height = BASE_CANVAS_HEIGHT;
      canvasDepthRef!.current!.width = (image1.width / image1.height) * BASE_CANVAS_HEIGHT;
      canvasDepthRef!
        .current!.getContext("2d")
        ?.drawImage(image1, 0, 0, canvasDepthRef!.current!.width, canvasDepthRef!.current!.height);

      canvas.height = BASE_CANVAS_HEIGHT;
      canvas.width = (image0.width / image0.height) * BASE_CANVAS_HEIGHT;

      updateResolution(canvas.width, canvas.height);
      updateTexture(image0, image1);

      render();
    })();
  }, [depthImageUrl, originalImageUrl]);

  return (
    <div className="container mx-auto h-screen flex justify-center items-center">
      <h1 className="text-6xl pb-12 fixed top-8 left-1/2 -translate-x-1/2">Fake 3D</h1>
      <div className="flex gap-8">
        <div className="relative">
          <canvas ref={canvasRef}></canvas>
          <canvas
            ref={canvasDepthRef}
            className="absolute top-0 left-0 z-10 pointer-events-none"
            style={{ opacity: depthImageOpacity }}
          ></canvas>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 w-80">
            图片： <SelectImage handleChange={handleChange} />
          </div>
          <div className="flex justify-between items-center gap-4 w-80">
            深度图透明度:
            <Slider
              min={0}
              max={1}
              value={depthImageOpacity}
              step={0.01}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              onChange={setDepthImageOpacity}
              className="w-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
