import { useToolsStore } from "../store/use-tools-store";
import LabelSliderGroup from "./label-slider-group";

function LinearControl() {
  const startPoint = useToolsStore(state => state.startPoint);
  const endPoint = useToolsStore(state => state.endPoint);
  const updateStartPoint = useToolsStore(state => state.updateStartPoint);
  const updateEndPoint = useToolsStore(state => state.updateEndPoint);
  return (
    <div className="px-4">
      <p className="text-2xl py-2">Linear</p>
      <LabelSliderGroup title="Start Point" point={startPoint} onChange={updateStartPoint} />
      <LabelSliderGroup title="End Point" point={endPoint} onChange={updateEndPoint} />
    </div>
  );
}

export default LinearControl;
