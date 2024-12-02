import { useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import { animate } from "@juliangarnierorg/anime-beta";

function App() {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;
    animate(logoRef.current, {
      rotate: 360,
      loop: true,
      autoplay: true,
      duration: 1000,
    });
  }, []);

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">Animejs-v4 Demo</h1>
      <img ref={logoRef} src={reactLogo} className="w-36 h-36" alt="react logo" />
    </div>
  );
}

export default App;
