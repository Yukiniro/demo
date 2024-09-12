import { Upload } from "@douyinfe/semi-ui";
import { useTextureStore } from "../store/use-texture-store";

function UploadImage() {
  const setPresetImageIndex = useTextureStore(state => state.setPresetImageIndex);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const customRequest = options => {
    const file = options.file.fileInstance;
    console.log(file);
    setPresetImageIndex(-1);
    // 上传文件并生成深度图
  };

  return (
    <Upload
      action=""
      className="w-[500px] h-[300px]"
      draggable={true}
      dragMainText={"点击上传文件或拖拽文件到这里"}
      limit={1}
      customRequest={customRequest}
      showUploadList={false}
    />
  );
}

export default UploadImage;
