import { useEffect, useRef } from "react";
import { useTextureStore } from "./store/use-texture-store";
import { useToolsStore } from "./store/use-tools-store";
import Layout from "./components/layout";
import Error from "./components/error";
import { Divider } from "@douyinfe/semi-ui";
import { bindCanvas } from "./store/app-store";
import Tools from "./components/tools";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const pending = useTextureStore(state => state.pending);
  const error = useTextureStore(state => state.error);
  const { init, updateViewSize } = useTextureStore(state => ({
    init: state.init,
    updateViewSize: state.updateViewSize,
  }));
  const triggerAnimationRender = useToolsStore(state => state.triggerAnimationRender);

  useEffect(() => init(), [init]);
  useEffect(() => {
    const box = canvasBoxRef.current;
    if (!box) {
      return;
    }
    const { width, height } = box.getBoundingClientRect();
    updateViewSize(width, height);
    triggerAnimationRender();
  }, [updateViewSize, triggerAnimationRender]);

  useEffect(() => {
    canvasRef.current && bindCanvas(canvasRef.current);
    triggerAnimationRender();
  }, [triggerAnimationRender]);

  if (error) {
    return <Error errorMessage={error.message} />;
  }

  return (
    <Layout>
      <div className="relative w-full h-[calc(100%-131px)]">
        <div
          ref={canvasBoxRef}
          className="flex items-center justify-center w-[calc(100%-400px)] h-full absolute left-0"
        >
          <canvas ref={canvasRef} />
        </div>
        <Divider className="absolute h-full right-[400px]" layout="vertical" />
        <Tools />
        {pending && (
          <div className="fixed top-0 left-0 w-full h-full bg-black opacity-75 flex justify-center items-center">
            Loading...
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
