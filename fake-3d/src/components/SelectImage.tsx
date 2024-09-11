import originalMountImageUrl from "../assets/mount.jpg";
import depthMountImageUrl from "../assets/mount-map.jpg";
import originalBallImageUrl from "../assets/ball.jpg";
import depthBallImageUrl from "../assets/ball-map.jpg";
import originalCanyonImageUrl from "../assets/canyon.jpg";
import depthCanyonImageUrl from "../assets/canyon-map.jpg";
import originalLadyImageUrl from "../assets/lady.jpg";
import depthLadyImageUrl from "../assets/lady-map.jpg";
import originalDogImageUrl from "../assets/dog.jpg";
import depthDogImageUrl from "../assets/dog-map.png";
import originalDogPhotoImageUrl from "../assets/dog-photo.jpg";
import depthDogPhotoImageUrl from "../assets/dog-depth-map.jpg";
import { Select } from "@douyinfe/semi-ui";

const IMAGE_INFO = [
  {
    name: "mount",
    originalImageUrl: originalMountImageUrl,
    depthImageUrl: depthMountImageUrl,
  },
  {
    name: "ball",
    originalImageUrl: originalBallImageUrl,
    depthImageUrl: depthBallImageUrl,
  },
  {
    name: "canyon",
    originalImageUrl: originalCanyonImageUrl,
    depthImageUrl: depthCanyonImageUrl,
  },
  {
    name: "lady",
    originalImageUrl: originalLadyImageUrl,
    depthImageUrl: depthLadyImageUrl,
  },
  {
    name: "dog",
    originalImageUrl: originalDogImageUrl,
    depthImageUrl: depthDogImageUrl,
  },
  {
    name: "dog photo",
    originalImageUrl: originalDogPhotoImageUrl,
    depthImageUrl: depthDogPhotoImageUrl,
  },
];

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
    <Select defaultValue={IMAGE_INFO[0].name} style={{ width: 120 }} onChange={handleChange}>
      {IMAGE_INFO.map(item => (
        <Select.Option key={item.name} value={item.name}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectImage;
export { IMAGE_INFO };
