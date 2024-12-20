import { Button } from "@/components/ui/button";
import Konva from "konva";
import { useRef, useEffect } from "react";

// const enabledAnchors = ["top-left", "top-right", "bottom-left", "bottom-right"];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  // const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const { width, height } = containerRef.current.getBoundingClientRect();
    appRef.current = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
    });
    const stage = appRef.current;
    if (!stage) {
      return;
    }

    const layer = new Konva.Layer();
    layerRef.current = layer;

    stage.add(layer);
  }, []);

  const handleNewRect = () => {
    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    const rect = new Konva.Rect({
      x: Math.floor(Math.random() * 401) + 100,
      y: Math.floor(Math.random() * 401) + 100,
      width: Math.floor(Math.random() * 401) + 100,
      height: Math.floor(Math.random() * 401) + 100,
      fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      draggable: true,
    });

    layer.add(rect);

    // transformerRef.current =
    //   transformerRef.current ||
    //   new Konva.Transformer({
    //     nodes: [rect],
    //     rotateAnchorOffset: 60,
    //     enabledAnchors: enabledAnchors,
    //   });

    // transformerRef.current.setNodes([rect]);
    // layer.add(transformerRef.current);
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <div className="fixed top-16 z-10">
        <Button onClick={handleNewRect}>New Rect</Button>
      </div>
      <div className="w-full h-full" ref={containerRef}></div>
    </div>
  );
}

export default App;
