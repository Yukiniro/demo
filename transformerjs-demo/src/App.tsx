import ViewRMBG from "@/components/view-rmbg";
import ViewDepth from "@/components/view-depth";
import ViewSummary from "@/components/view-summary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [viewType, setViewType] = useState<"rmbg" | "depth" | "summary">("rmbg");
  const [device, setDevice] = useState<"webgpu" | "wasm">("webgpu");
  const views = {
    rmbg: {
      View: ViewRMBG,
      text: "移除背景",
    },
    depth: {
      View: ViewDepth,
      text: "生成深度图",
    },
    summary: {
      View: ViewSummary,
      text: "生成摘要",
      disableWASM: true,
    },
  };
  const View = views[viewType].View;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const disableGPU = !!views[viewType].disableGPU;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const disableWASM = !!views[viewType].disableWASM;

  const handleViewChange = (value: "rmbg" | "depth" | "summary") => {
    setViewType(value);
    setDevice("webgpu");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <div className="space-y-6 text-center fixed top-12 left-0 w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold tracking-tight">Transformers.js</h1>
          <div className="flex items-center space-x-4">
            <Select value={viewType} onValueChange={handleViewChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择功能" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(views).map(([key]) => (
                  <SelectItem key={key} value={key}>
                    {views[key as keyof typeof views].text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={device} onValueChange={value => setDevice(value as "webgpu" | "wasm")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择设备" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled={disableGPU} value="webgpu">
                  WebGPU
                </SelectItem>
                <SelectItem disabled={disableWASM} value="wasm">
                  WASM
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {View && <View device={device} />}
      </div>
      <Toaster />
    </>
  );
}

export default App;
