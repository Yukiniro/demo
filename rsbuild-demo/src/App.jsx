import { lazy } from "react";
import "./App.css";

const LazyBanner = lazy(() => import("./LazyBanner"));

const App = () => {
  return (
    <div className="content">
      <LazyBanner />
      <h2>Rsbuild with React</h2>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
