import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";

function App() {
  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">Vite + React + Daisyui</h1>
      <label className="swap swap-flip">
        <input type="checkbox" />
        <div className="swap-on">
          <img src={viteLogo} className="w-36 h-36" alt="Vite logo" />
        </div>
        <div className="swap-off">
          <img src={reactLogo} className="w-36 h-36" alt="React logo" />
        </div>
      </label>
    </div>
  );
}

export default App;
