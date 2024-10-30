import { useCallback } from "react";
import { useToolsStore } from "../store/use-tools-store";
import { Slider } from "@douyinfe/semi-ui";

function Tools() {
  const { borderSize, updateBorderSize } = useToolsStore(state => ({
    borderSize: state.borderSize,
    updateBorderSize: state.updateBorderSize,
  }));

  const handleBorderSizeChange = useCallback(
    (value: number | number[] | undefined) => {
      if (typeof value === "number") {
        updateBorderSize(value);
      }
    },
    [updateBorderSize],
  );

  return (
    <div className="flex flex-col w-[400px] h-full absolute right-0 py-6 overflow-y-scroll">
      <div className="flex justify-between items-center gap-4 px-4 py-4">
        <span>Border Size</span>
        <Slider
          className="w-[200px]"
          min={0}
          max={100}
          step={1}
          onChange={handleBorderSizeChange as (value: number | number[] | undefined) => void}
          value={borderSize}
          showBoundary
        ></Slider>
      </div>
    </div>
  );
}

export default Tools;
