import { useRef, useEffect } from "react";
import Toolbar from "./components/toolbar";
import { initApp } from "./store";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    initApp(containerRef.current);
  }, []);

  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <div className="w-full h-full" ref={containerRef}></div>
      <Toolbar />
    </div>
  );
}

export default App;
