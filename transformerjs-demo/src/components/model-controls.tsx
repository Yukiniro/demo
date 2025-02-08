import { Button } from "@/components/ui/button";

interface ModelControlsProps {
  isModelReady: boolean;
  pending: boolean;
  prepareModelTime: number;
  pendingTime: number;
  hideButton?: boolean;
  onPrepareModel: () => void;
  onGenerate: () => void;
}

export default function ModelControls({
  isModelReady,
  pending,
  prepareModelTime,
  pendingTime,
  hideButton,
  onPrepareModel,
  onGenerate,
}: ModelControlsProps) {
  const prepareModelTimeText = prepareModelTime === 0 ? "NaN" : (prepareModelTime / 1e3).toFixed(2);
  const pendingTimeText = pendingTime === 0 ? "NaN" : (pendingTime / 1e3).toFixed(2);

  return (
    <div className="space-y-2">
      {!isModelReady && !hideButton && (
        <Button disabled={pending} onClick={onPrepareModel} className="w-32">
          准备模型
        </Button>
      )}
      {isModelReady && !hideButton && (
        <Button disabled={pending} onClick={onGenerate} className="w-32">
          推理
        </Button>
      )}
      <p className="text-muted-foreground">加载模型时间: {prepareModelTimeText}s</p>
      <p className="text-muted-foreground">处理时间: {pendingTimeText}s</p>
    </div>
  );
}
