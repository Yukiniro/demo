import { Select } from "@douyinfe/semi-ui";
import { IMAGE_INFO } from "../config";

interface SelectImageProps {
  handleChange: (originalImageUrl: string, depthImageUrl: string) => void;
}

function SelectImage(props: SelectImageProps) {
  const handleChange = (value: string) => {
    const info = IMAGE_INFO.find(item => item.name === value);
    if (info) {
      props.handleChange(info.originalImageUrl, info.depthImageUrl);
    }
  };
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <Select defaultValue={IMAGE_INFO[4].name} style={{ width: 120 }} onChange={handleChange}>
      {IMAGE_INFO.map(item => (
        <Select.Option key={item.name} value={item.name}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectImage;
