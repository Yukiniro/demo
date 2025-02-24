import { useRef, useEffect } from "react";
import Toolbar from "./components/toolbar";
import { initApp } from "./store";
import { TextEdit } from "./components/text-edit";
import Keyboard from "./components/keyboard";

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
      <div className="w-2/3 h-2/3 bg-white" ref={containerRef}></div>
      <Toolbar />
      <TextEdit />
      <Keyboard />
    </div>
  );
}

export default App;
