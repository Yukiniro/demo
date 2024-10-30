import { useEffect } from "react";
import { useTextureStore } from "./store/use-texture-store";
import Layout from "./components/layout";
import Error from "./components/error";
import { Divider } from "@douyinfe/semi-ui";
import Tools from "./components/tools";
import PreviewBox from "./components/preview-box";
import UploadImage from "./components/upload-image";
import LoadingView from "./components/loading-view";
import { VERSION } from "./config";

function App() {
  const { pending, isGenerating, error, imageUrl } = useTextureStore(state => {
    return {
      pending: state.pending,
      error: state.error,
      imageUrl: state.imageUrl,
      isGenerating: state.isGenerating,
    };
  });
  const init = useTextureStore(state => state.init);

  useEffect(() => {
    console.log("outline app version:", VERSION);
  }, []);

  useEffect(() => init(), [init]);

  if (error) {
    return <Error errorMessage={error.message} />;
  }

  if (!imageUrl) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center gap-12 w-full h-[calc(100%-131px)]">
          <UploadImage />
        </div>
        {(pending || isGenerating) && <LoadingView />}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative w-full h-[calc(100%-131px)]">
        <PreviewBox />
        <Divider className="absolute h-full right-[400px]" layout="vertical" />
        <Tools />
      </div>
      {(pending || isGenerating) && <LoadingView />}
    </Layout>
  );
}

export default App;
