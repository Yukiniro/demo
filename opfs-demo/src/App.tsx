import { useState } from "react";
import { SceneRadioGroup } from "./components/scene-radio-group";
import { InputFS } from "./components/input-fs";
import { PickerFS } from "./components/picker-fs";
import { OpFs } from "./components/op-fs";

const fsList = [
  {
    value: "input-fs",
    label: "Input FS",
  },
  {
    value: "picker-fs",
    label: "Picker FS",
  },
  {
    value: "op-fs",
    label: "OPFS",
  },
];

function App() {
  const [fsType, setAnimation] = useState(fsList[2].value);
  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl py-16  w-full text-center font-mono font-bold">FS Demo</h1>
      <SceneRadioGroup list={fsList} value={fsType} onChange={v => setAnimation(v)} />
      <div
        className="border-t border-black w-full flex justify-center items-center"
        style={{ height: "calc(100vh - 156px)" }}
      >
        {fsType === "input-fs" && <InputFS />}
        {fsType === "picker-fs" && <PickerFS />}
        {fsType === "op-fs" && <OpFs />}
      </div>
    </div>
  );
}

export default App;
