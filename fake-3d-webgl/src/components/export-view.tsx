import { useExportStore } from "../store/use-export-store";
import { Progress } from "@douyinfe/semi-ui";

function ExportView() {
  const { exportProgress } = useExportStore();
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white opacity-95">
      <Progress strokeWidth={12} percent={exportProgress} strokeGradient={true} showInfo type="circle" width={150} />
    </div>
  );
}

export default ExportView;
