import { useCallback, useMemo } from "react";
import { useToolsStore } from "../store/use-tools-store";
import ManualSettingsControl from "./manual-settingsControl-control";
import Presets from "./presets";
import SelectImage from "./select-image";
import { Divider, Slider, Button } from "@douyinfe/semi-ui";
import LabelSwitch from "./label-switch";
import { useExportStore } from "../store/use-export-store";

function Tools() {
  const {
    amount,
    animationDuration,
    focus,
    edgeDilation,
    isLoop,
    isReverse,
    isLoopDisabled,
    isReverseDisabled,
    depthMapOpacity,
  } = useToolsStore(state => ({
    amount: state.amount,
    animationDuration: state.animationDuration,
    focus: state.focus,
    edgeDilation: state.edgeDilation,
    isLoop: state.isLoop,
    isReverse: state.isReverse,
    isLoopDisabled: state.isLoopDisabled,
    isReverseDisabled: state.isReverseDisabled,
    depthMapOpacity: state.depthMapOpacity,
  }));
  const {
    updateAmount,
    updateAnimationDuration,
    updateFocus,
    updateEdgeDilation,
    updateIsLoop,
    updateIsReverse,
    updateDepthMapOpacity,
  } = useToolsStore(state => ({
    updateAmount: state.updateAmount,
    updateAnimationDuration: state.updateAnimationDuration,
    updateFocus: state.updateFocus,
    updateEdgeDilation: state.updateEdgeDilation,
    updateIsLoop: state.updateIsLoop,
    updateIsReverse: state.updateIsReverse,
    updateDepthMapOpacity: state.updateDepthMapOpacity,
  }));

  const exportVideo = useExportStore(state => state.exportVideo);

  const commonSettings = useMemo(() => {
    return [
      { label: "Amount of Motion", min: 0, max: 1, step: 0.01, value: amount, onChange: updateAmount },
      {
        label: "Animation Length",
        min: 0,
        max: 10,
        step: 0.1,
        value: animationDuration,
        onChange: updateAnimationDuration,
      },
      { label: "Focus Point", min: 0, max: 1, step: 0.01, value: focus, onChange: updateFocus },
      { label: "Edge Dilation", min: 0, max: 1, step: 0.01, value: edgeDilation, onChange: updateEdgeDilation },
    ];
  }, [
    amount,
    animationDuration,
    edgeDilation,
    focus,
    updateAmount,
    updateAnimationDuration,
    updateEdgeDilation,
    updateFocus,
  ]);

  const handleDepthMapOpacityChange = useCallback(
    (value: number | number[] | undefined) => {
      if (typeof value === "number") {
        updateDepthMapOpacity(value);
      }
    },
    [updateDepthMapOpacity],
  );

  return (
    <div className="flex flex-col w-[400px] h-full absolute right-0 py-6 overflow-y-scroll">
      <div className="flex justify-center items-center w-full py-2">
        <Button onClick={exportVideo} block theme="solid" type="primary" size="large" style={{ marginRight: 8 }}>
          Export Video
        </Button>
      </div>
      <Divider />
      <div className="flex justify-between items-center gap-4 px-4 py-2">
        选择图片： <SelectImage />
      </div>
      <Divider />
      <div className="flex justify-between items-center gap-4 px-4 py-4">
        <span>深度图透明度</span>
        <Slider
          className="w-[200px]"
          min={0}
          max={100}
          step={1}
          onChange={handleDepthMapOpacityChange as (value: number | number[] | undefined) => void}
          value={depthMapOpacity}
          showBoundary
        ></Slider>
      </div>
      <Divider />
      <LabelSwitch label="Loop" checked={isLoop} disabled={isLoopDisabled} onChange={updateIsLoop} />
      <LabelSwitch label="Reverse" checked={isReverse} disabled={isReverseDisabled} onChange={updateIsReverse} />
      <Presets />
      <Divider />
      <ManualSettingsControl />
      {commonSettings.map(({ label, min, max, step, value, onChange }) => (
        <div className="py-4 px-4 border-t" key={label}>
          <div>{label}</div>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error */}
          <Slider min={min} max={max} step={step || 1} onChange={onChange} value={value} showBoundary></Slider>
        </div>
      ))}
    </div>
  );
}

export default Tools;
