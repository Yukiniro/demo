import { useTextureStore } from "../store/use-texture-store";
import LinearControl from "./linear-control";
import Presets from "./presets";
import SelectImage from "./select-image";
import { Slider } from "@douyinfe/semi-ui";

function Tools() {
  const { setImages } = useTextureStore(state => ({
    setImages: state.setImages,
  }));
  const handleChange = (originalImageUrl: string, depthImageUrl: string): void => {
    setImages(originalImageUrl, depthImageUrl);
  };

  return (
    <div className="flex flex-col w-[400px] h-full absolute right-0 py-6 overflow-y-scroll">
      <div className="flex justify-between items-center gap-4 px-4 py-2">
        选择图片： <SelectImage handleChange={handleChange} />
      </div>
      <Presets />
      <LinearControl />
      {[
        { label: "Amount of Motion", min: 0, max: 100 },
        { label: "Animation Length", min: 0, max: 10 },
        { label: "Focus Point", min: 0, max: 10 },
        { label: "Edge Dilation", min: 0, max: 10 },
      ].map(({ label, min, max }) => (
        <div className="py-4 px-4 border-t" key={label}>
          <div>{label}</div>
          <Slider min={min} max={max} showBoundary></Slider>
        </div>
      ))}
    </div>
  );
}

export default Tools;
