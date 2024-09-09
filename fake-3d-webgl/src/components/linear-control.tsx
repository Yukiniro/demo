import { Slider } from "@douyinfe/semi-ui";
import { useToolsStore } from "../store/use-tools-store";

function PositionSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="py-2">
      <div>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <Slider min={-1} max={1} step={0.01} onChange={onChange} value={value} showBoundary={true}></Slider>
    </div>
  );
}

function PointGroup(props: {
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
      <PositionSlider label="Position X" value={x} onChange={updateX} />
      <PositionSlider label="Position Y" value={y} onChange={updateY} />
      <PositionSlider label="Position Z" value={z} onChange={updateZ} />
    </>
  );
}

function LinearControl() {
  const startPoint = useToolsStore(state => state.startPoint);
  const endPoint = useToolsStore(state => state.endPoint);
  const updateStartPoint = useToolsStore(state => state.updateStartPoint);
  const updateEndPoint = useToolsStore(state => state.updateEndPoint);
  return (
    <div className="px-4">
      <p className="text-2xl py-2">Linear</p>
      <PointGroup title="Start Point" point={startPoint} onChange={updateStartPoint} />
      <PointGroup title="End Point" point={endPoint} onChange={updateEndPoint} />
    </div>
  );
}

export default LinearControl;
