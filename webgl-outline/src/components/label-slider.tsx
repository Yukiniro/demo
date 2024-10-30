import { Slider } from "@douyinfe/semi-ui";

interface LabelSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function LabelSlider({ label, value, onChange, min = -1, max = 1, step = 0.01 }: LabelSliderProps) {
  return (
    <div className="py-4">
      <div>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <Slider min={min} max={max} step={step} onChange={onChange} value={value} showBoundary={true}></Slider>
    </div>
  );
}

export default LabelSlider;
