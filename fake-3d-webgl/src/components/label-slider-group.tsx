import LabelSlider from "./label-slider";

function LabelSliderGroup(props: {
  point: { x: number; y: number; z: number };
  title: string;
  onChange: (x: number, y: number, z: number) => void;
}) {
  const { point, title, onChange } = props;
  const { x, y, z } = point;
  const updateX = (x: number) => onChange(x, y, z);
  const updateY = (y: number) => onChange(x, y, z);
  const updateZ = (z: number) => onChange(x, y, z);
  return (
    <>
      <p className="text-xl">{title}</p>
      <LabelSlider label="Position X" value={x} onChange={updateX} />
      <LabelSlider label="Position Y" value={y} onChange={updateY} />
      <LabelSlider label="Position Z" value={z} onChange={updateZ} />
    </>
  );
}

export default LabelSliderGroup;
