import { Button } from "@/components/ui/button";
import Konva from "konva";
import { useRef, useEffect } from "react";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const { width, height } = containerRef.current.getBoundingClientRect();
    const stage = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
    });

    const layer = new Konva.Layer({ draggable: true });

    const rect = new Konva.Rect({
      x: 100,
      y: 500,
      width: 500,
      height: 500,
      fill: "blue",
    });

    const transformer = new Konva.Transformer({
      nodes: [rect],
      rotateAnchorOffset: 60,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    });
    layer.add(transformer);

    layer.add(rect);
    stage.add(layer);
  }, []);

  return (
    <div ref={containerRef} className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl fixed top-16">Konva.js</h1>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
