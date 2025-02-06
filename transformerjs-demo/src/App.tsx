import ViewRMBG from "@/components/view-rmbg";
import ViewDepth from "@/components/view-depth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

function App() {
  const [viewType, setViewType] = useState<"rmbg" | "depth">("rmbg");
  const views = {
    rmbg: {
      View: ViewRMBG,
      text: "移除背景",
    },
    depth: {
      View: ViewDepth,
      text: "生成深度图",
    },
  };
  const View = views[viewType].View;
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <div className="space-y-6 text-center fixed top-12 left-0 w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold tracking-tight">Transformers.js</h1>
          <Select value={viewType} onValueChange={value => setViewType(value as "rmbg" | "depth")}>
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
        </div>
        {View && <View />}
      </div>
    </>
  );
}

export default App;
