import ViewRMBG from "@/components/view-rmbg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

function App() {
  const [viewType, setViewType] = useState<"rmbg" | "translation">("rmbg");
  const views = {
    rmbg: ViewRMBG,
    translation: null,
  };
  const View = views[viewType];
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <div className="space-y-6 text-center fixed top-12 left-0 w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold tracking-tight">Transformers.js</h1>
          <Select value={viewType} onValueChange={value => setViewType(value as "rmbg" | "translation")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择功能" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(views).map(([key, _]) => (
                <SelectItem key={key} value={key}>
                  {key === "rmbg" ? "移除背景" : "文本翻译"}
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
