import { useRef, useEffect } from "react";
import Toolbar from "./components/toolbar";
import { initApp } from "./store";
import { TextEdit } from "./components/text-edit";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    initApp(containerRef.current);
  }, []);

  return (
    <div className="flex items-center justify-center flex-col w-full h-full bg-gray-200">
      <div className="w-[1280px] h-[720px] bg-white" ref={containerRef}></div>
      <Toolbar />
      <TextEdit />
    </div>
  );
}

export default App;
