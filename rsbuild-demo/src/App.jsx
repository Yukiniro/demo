import { lazy } from "react";
import "./App.css";
import { ReactComponent as PlayIcon } from "./assets/play.svg";

const LazyBanner = lazy(() => import("./LazyBanner"));

const App = () => {
  return (
    <div className="content">
      <LazyBanner />
      <h2>Rsbuild with React</h2>
      <p>Start building amazing things with Rsbuild.</p>
      <div
        style={{
          width: 50,
          height: 50,
          background: "white",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PlayIcon />
      </div>
    </div>
  );
};

export default App;
