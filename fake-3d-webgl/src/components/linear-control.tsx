import { Slider } from "@douyinfe/semi-ui";

function PositionSlider({ label }: { label: string }) {
  return (
    <div className="py-2">
      <div>{label}</div>
      <Slider min={-1} max={1} step={0.01} showBoundary={true}></Slider>
    </div>
  );
}

function LinearControl() {
  return (
    <div className="px-4">
      <p className="text-2xl py-2">Linear</p>
      <p className="text-xl">Start Point</p>
      <PositionSlider label="Position X" />
      <PositionSlider label="Position Y" />
      <PositionSlider label="Position Z" />
      <p className="text-xl">End Point</p>
      <PositionSlider label="Position X" />
      <PositionSlider label="Position Y" />
      <PositionSlider label="Position Z" />
    </div>
  );
}

export default LinearControl;
