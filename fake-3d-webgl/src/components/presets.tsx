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

function PresetItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-24 h-24 flex items-center justify-center border border-1 hover:bg-gray-200 cursor-pointer">
      {children}
    </div>
  );
}

function Presets() {
  return (
    <div className="grid grid-cols-3 px-4 py-2 gap-4">
      {presetItems.map(item => (
        <PresetItem key={item}>{item}</PresetItem>
      ))}
    </div>
  );
}

export default Presets;
