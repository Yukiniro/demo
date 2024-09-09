import { useEffect, useRef, useState } from "react";
import SelectImage, { IMAGE_INFO } from "./components/SelectImage";
import { useTextureStore } from "./store/use-texture-store";
import Layout from "./components/layout";
import Error from "./components/error";
import { render } from "./store/render-store";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewSize = useTextureStore(state => state.viewSize);
  const pending = useTextureStore(state => state.pending);
  const error = useTextureStore(state => state.error);
  const { init, setImages } = useTextureStore(state => ({ init: state.init, setImages: state.setImages }));

  const [originalImageUrl, setOriginalImageUrl] = useState(IMAGE_INFO[4].originalImageUrl);
  const [depthImageUrl, setDepthImageUrl] = useState(IMAGE_INFO[4].depthImageUrl);

  const handleChange = (originalImageUrl: string, depthImageUrl: string): void => {
    setOriginalImageUrl(originalImageUrl);
    setDepthImageUrl(depthImageUrl);
  };

  useEffect(() => init(), [init]);

  useEffect(() => {
    if (!originalImageUrl || !depthImageUrl) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setImages(originalImageUrl, depthImageUrl);
    render(canvas);
  }, [depthImageUrl, originalImageUrl, setImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = viewSize.width;
    canvas.height = viewSize.height;

    render(canvas);
  }, [viewSize]);

  if (pending) {
    return <Layout>Loading...</Layout>;
  }

  if (error) {
    return <Error errorMessage={error.message} />;
  }

  return (
    <Layout>
      <div className="flex gap-8">
        <div className="relative">
          <canvas ref={canvasRef} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 w-80">
            图片： <SelectImage handleChange={handleChange} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
