import { useState } from "react";
import { SceneRadioGroup } from "./components/scene-radio-group";
import Combinate from "./components/combinate";
import PlayVideo from "./components/play-video";

const animations = [
  {
    value: "play-video",
    label: "Play Video",
  },
  {
    value: "combine-audio-video",
    label: "Combine AV",
  },
];

function App() {
  const [animation, setAnimation] = useState(animations[0].value);
  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl py-16  w-full text-center font-mono font-bold">WeAV Demo</h1>
      <SceneRadioGroup list={animations} value={animation} onChange={v => setAnimation(v)} />
      <div className="border-t border-black w-full flex" style={{ height: "calc(100vh - 156px)" }}>
        {animation === "play-video" && <PlayVideo />}
        {animation === "combine-audio-video" && <Combinate />}
      </div>
    </div>
  );
}

export default App;
