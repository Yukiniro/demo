import LabelSlider from "./label-slider";

function LabelSliderGroup(props: {
  point: { x: number; y: number; z: number };
  title: string;
  labelPrefix: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (x: number, y: number, z: number) => void;
}) {
  const { point, title, labelPrefix, step, min, max, onChange } = props;
  const { x, y, z } = point;
  const updateX = (x: number) => onChange(x, y, z);
  const updateY = (y: number) => onChange(x, y, z);
  const updateZ = (z: number) => onChange(x, y, z);
  return (
    <>
      <p className="text-xl">{title}</p>
      <LabelSlider label={`${labelPrefix} X`} value={x} onChange={updateX} step={step} min={min} max={max} />
      <LabelSlider label={`${labelPrefix} Y`} value={y} onChange={updateY} step={step} min={min} max={max} />
      <LabelSlider label={`${labelPrefix} Z`} value={z} onChange={updateZ} step={step} min={min} max={max} />
    </>
  );
}

export default LabelSliderGroup;
