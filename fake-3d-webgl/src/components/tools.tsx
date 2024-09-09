import { useCallback, useEffect, useMemo } from "react";
import { useTextureStore } from "../store/use-texture-store";
import { useToolsStore } from "../store/use-tools-store";
import LinearControl from "./linear-control";
import Presets from "./presets";
import SelectImage, { IMAGE_INFO } from "./select-image";
import { Slider } from "@douyinfe/semi-ui";

function Tools() {
  const { setImages } = useTextureStore(state => ({
    setImages: state.setImages,
  }));
  const { amount, animationDuration, focus, edgeDilation } = useToolsStore(state => ({
    amount: state.amount,
    animationDuration: state.animationDuration,
    focus: state.focus,
    edgeDilation: state.edgeDilation,
  }));
  const { updateAmount, updateAnimationDuration, updateFocus, updateEdgeDilation } = useToolsStore(state => ({
    updateAmount: state.updateAmount,
    updateAnimationDuration: state.updateAnimationDuration,
    updateFocus: state.updateFocus,
    updateEdgeDilation: state.updateEdgeDilation,
  }));

  const handleChange = useCallback(
    (originalImageUrl: string, depthImageUrl: string): void => {
      setImages(originalImageUrl, depthImageUrl);
    },
    [setImages],
  );

  const commonSettings = useMemo(() => {
    return [
      { label: "Amount of Motion", min: 0, max: 100, value: amount, onChange: updateAmount },
      { label: "Animation Length", min: 0, max: 10, value: animationDuration, onChange: updateAnimationDuration },
      { label: "Focus Point", min: 0, max: 1, step: 0.1, value: focus, onChange: updateFocus },
      { label: "Edge Dilation", min: 0, max: 10, value: edgeDilation, onChange: updateEdgeDilation },
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

  useEffect(() => {
    handleChange(IMAGE_INFO[4].originalImageUrl, IMAGE_INFO[4].depthImageUrl);
  }, [handleChange]);

  return (
    <div className="flex flex-col w-[400px] h-full absolute right-0 py-6 overflow-y-scroll">
      <div className="flex justify-between items-center gap-4 px-4 py-2">
        选择图片： <SelectImage handleChange={handleChange} />
      </div>
      <Presets />
      <LinearControl />
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
