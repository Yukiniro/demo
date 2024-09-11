import { useCallback } from "react";
import { MotionType, useToolsStore } from "../store/use-tools-store";
import LabelSliderGroup from "./label-slider-group";
import { Tabs, TabPane } from "@douyinfe/semi-ui";

function ManualSettingsControl() {
  const startPoint = useToolsStore(state => state.startPoint);
  const endPoint = useToolsStore(state => state.endPoint);
  const middlePoint = useToolsStore(state => state.middlePoint);
  const amplitudePoint = useToolsStore(state => state.amplitudePoint);
  const phasePoint = useToolsStore(state => state.phasePoint);
  const motionType = useToolsStore(state => state.motionType);

  const updateStartPoint = useToolsStore(state => state.updateStartPoint);
  const updateEndPoint = useToolsStore(state => state.updateEndPoint);
  const updateMiddlePoint = useToolsStore(state => state.updateMiddlePoint);
  const updateAmplitudePoint = useToolsStore(state => state.updateAmplitudePoint);
  const updatePhasePoint = useToolsStore(state => state.updatePhasePoint);
  const updateMotionType = useToolsStore(state => state.updateMotionType);

  const handleChange = useCallback(
    (activeKey: string) => {
      updateMotionType(activeKey as MotionType);
    },
    [updateMotionType],
  );

  return (
    <div className="px-4 py-2">
      <Tabs type="button" activeKey={motionType} onChange={handleChange}>
        <TabPane tab="Circular" itemKey="CIRCULAR">
          <LabelSliderGroup
            title="Amplitude"
            point={amplitudePoint}
            onChange={updateAmplitudePoint}
            labelPrefix="Amplitude"
            step={0.01}
            min={0}
            max={1}
          />
          <LabelSliderGroup
            title="Phase"
            point={phasePoint}
            onChange={updatePhasePoint}
            labelPrefix="Phase"
            step={1}
            min={0}
            max={3}
          />
        </TabPane>
        <TabPane tab="Linear" itemKey="LINEAR">
          <LabelSliderGroup
            title="Start Point"
            point={startPoint}
            onChange={updateStartPoint}
            labelPrefix="Start Point"
          />
          <LabelSliderGroup title="End Point" point={endPoint} onChange={updateEndPoint} labelPrefix="End Point" />
        </TabPane>
        <TabPane tab="Arc" itemKey="THREEPOINTLINEAR">
          <LabelSliderGroup
            title="Start Point"
            point={startPoint}
            onChange={updateStartPoint}
            labelPrefix="Start Point"
          />
          <LabelSliderGroup
            title="Middle Point"
            point={middlePoint}
            onChange={updateMiddlePoint}
            labelPrefix="Middle Point"
          />
          <LabelSliderGroup title="End Point" point={endPoint} onChange={updateEndPoint} labelPrefix="End Point" />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ManualSettingsControl;
