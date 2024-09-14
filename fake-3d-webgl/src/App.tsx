import { useEffect } from "react";
import { useTextureStore } from "./store/use-texture-store";
import Layout from "./components/layout";
import Error from "./components/error";
import { Divider } from "@douyinfe/semi-ui";
import Tools from "./components/tools";
import { useExportStore } from "./store/use-export-store";
import ExportView from "./components/export-view";
import SelectImage from "./components/select-image";
import PreviewBox from "./components/preview-box";
import UploadImage from "./components/upload-image";
import LoadingView from "./components/loading-view";
import { VERSION } from "./config";

function App() {
  const { pending, isGenerating, error, originalImageUrl } = useTextureStore(state => {
    return {
      pending: state.pending,
      error: state.error,
      originalImageUrl: state.originalImageUrl,
      isGenerating: state.isGenerating,
    };
  });
  const isExporting = useExportStore(state => state.isExporting);
  const init = useTextureStore(state => state.init);

  useEffect(() => {
    console.log("fake-3d app version:", VERSION);
  }, []);

  useEffect(() => init(), [init]);

  if (error) {
    return <Error errorMessage={error.message} />;
  }

  if (!originalImageUrl) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center gap-12 w-full h-[calc(100%-131px)]">
          <div>
            使用预设：
            <SelectImage />
          </div>
          <p>或者</p>
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
      {isExporting && <ExportView />}
      {(pending || isGenerating) && <LoadingView />}
    </Layout>
  );
}

export default App;
