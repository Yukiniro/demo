import { useRef, useEffect } from "react";
import { initApp } from "../store";
import { viewSizeAtom } from "../store/atom-store";
import { useAtomValue } from "jotai";

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewSize = useAtomValue(viewSizeAtom);
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    initApp(containerRef.current);
  }, []);
  return (
    <div
      className="w-2/3 h-2/3 bg-white"
      ref={containerRef}
      style={{ width: viewSize.width, height: viewSize.height }}
    />
  );
}
