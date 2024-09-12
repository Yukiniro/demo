import { Select } from "@douyinfe/semi-ui";
import { IMAGE_INFO } from "../config";
import { useTextureStore } from "../store/use-texture-store";

function SelectImage() {
  const { setImages, setPresetImageIndex, presetImageIndex } = useTextureStore(state => ({
    setImages: state.setImages,
    setPresetImageIndex: state.setPresetImageIndex,
    presetImageIndex: state.presetImageIndex,
  }));

  const handleChange = (value: string) => {
    const index = IMAGE_INFO.findIndex(item => item.name === value);
    setPresetImageIndex(index);
    const info = IMAGE_INFO[index];
    if (info) {
      setImages(info.originalImageUrl, info.depthImageUrl);
    }
  };

  const value = presetImageIndex === -1 ? "None" : IMAGE_INFO[presetImageIndex].name;

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <Select value={value} style={{ width: 120 }} onChange={handleChange}>
      {IMAGE_INFO.map(item => (
        <Select.Option key={item.name} value={item.name}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectImage;
