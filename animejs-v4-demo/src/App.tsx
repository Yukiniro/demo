import { useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import { animate } from "@juliangarnierorg/anime-beta";

function App() {
  const logoRef = useRef<HTMLImageElement>(null);
  const valueDomRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<{ value: number }>({ value: 0 });

  useEffect(() => {
    if (!logoRef.current) return;
    animate(logoRef.current, {
      rotate: 360,
      loop: true,
      autoplay: true,
      duration: 1000,
    });

    animate(targetRef.current, {
      value: [100, 500],
      loop: true,
      autoplay: false,
      duration: 1000,
      onRender: () => {
        valueDomRef!.current!.innerText = targetRef.current.value.toString();
      },
    });
  }, []);

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">Animejs-v4 Demo</h1>
      <img ref={logoRef} src={reactLogo} className="w-36 h-36" alt="react logo" />
      <div ref={valueDomRef}></div>
    </div>
  );
}

export default App;
