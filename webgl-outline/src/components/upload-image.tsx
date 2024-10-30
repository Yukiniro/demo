import { Upload, Toast } from "@douyinfe/semi-ui";
import { useTextureStore } from "../store/use-texture-store";

function UploadImage() {
  const setImages = useTextureStore(state => state.setImages);
  const setIsGenerating = useTextureStore(state => state.setIsGenerating);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const customRequest = async options => {
    const file = options.file.fileInstance;
    if (!file.type.startsWith("image/")) {
      Toast.error({
        content: "上传的文件不是图片",
        duration: 3,
        stack: true,
      });
      return;
    }

    try {
      setIsGenerating(true);
      setImages(URL.createObjectURL(file));
    } catch (error: unknown) {
      Toast.error({
        content: (error as Error)?.message,
        duration: 3,
        stack: true,
      });
    } finally {
      setIsGenerating(false);
    }
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
      accept="image/*"
    />
  );
}

export default UploadImage;
