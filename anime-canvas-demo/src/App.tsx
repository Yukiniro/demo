import BasicAnimation from "./components/animations/basic-animation";
import TextAnimation from "./components/animations/text-animation";
import { AnimationRadioGroup } from "./components/animations/animation-radio-group";
import { useState } from "react";

const animations = [
  {
    value: "basic",
    label: "Basic Animation",
  },
  {
    value: "text",
    label: "Text Animation",
  },
];

function App() {
  const [animation, setAnimation] = useState(animations[1].value);

  return (
    <div className="w-full h-full">
      <h1 className="text-6xl py-16  w-full text-center font-mono font-bold">Anime Canvas</h1>
      <AnimationRadioGroup list={animations} value={animation} onChange={v => setAnimation(v)} />
      <div className="border-t border-black w-full flex" style={{ height: "calc(100vh - 156px)" }}>
        {animation === "basic" && <BasicAnimation />}
        {animation === "text" && <TextAnimation />}
      </div>
    </div>
  );
}

export default App;
