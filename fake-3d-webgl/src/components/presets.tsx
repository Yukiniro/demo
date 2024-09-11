import { useMemo } from "react";
import { PresetType, useToolsStore } from "../store/use-tools-store";

const presetItems = [
  "Vertical",
  "Horizontal",
  "Circle",
  "Perspective",
  "Zoom",
  "Dolly",
  "Zoom Left",
  "Zoom Center",
  "Zoom Right",
  "Custom",
];

function PresetItem({
  children,
  active,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const style = useMemo(() => {
    if (active) {
      return {
        border: "1px solid #EC8728",
      };
    } else {
      return {};
    }
  }, [active]);
  return (
    <div
      className="w-24 h-24 flex items-center justify-center border border-1 hover:bg-gray-100 cursor-pointer"
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Presets() {
  const presetType = useToolsStore(state => state.presetType);
  const updatePresetType = useToolsStore(state => state.updatePresetType);
  return (
    <div className="grid grid-cols-3 px-4 py-2 gap-4">
      {presetItems.map(item => (
        <PresetItem key={item} active={presetType === item} onClick={() => updatePresetType(item as PresetType)}>
          {item}
        </PresetItem>
      ))}
    </div>
  );
}

export default Presets;
