import Toolbar from "./components/toolbar";
import { TextEdit } from "./components/text-edit";
import Keyboard from "./components/keyboard";
import Preview from "./components/preview";

function App() {
  return (
    <div className="flex items-center justify-center flex-col w-full h-full bg-gray-200">
      <Preview />
      <Toolbar />
      <TextEdit />
      <Keyboard />
    </div>
  );
}

export default App;
