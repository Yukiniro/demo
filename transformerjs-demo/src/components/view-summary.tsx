import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "./ui/textarea";
import ModelControls from "./model-controls";
import useModelState from "@/hooks/useModelState";

const text = `Naruto[a] is a Japanese manga series written and illustrated by Masashi Kishimoto. It tells the story of Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village. The story is told in two parts: the first is set in Naruto's pre-teen years (volumes 1–27), and the second in his teens (volumes 28–72). The series is based on two one-shot manga by Kishimoto: Karakuri (1995), which earned Kishimoto an honorable mention in Shueisha's monthly Hop Step Award the following year, and Naruto (1997).`;

export default function ViewSummary() {
  const worker = useRef<Worker | null>(null);

  const [state, actions] = useModelState(text);
  const { prepareModelTime, pendingTime, isModelReady, input, output, pending } = state;
  const { setPrepareModelTime, setPendingTime, setIsModelReady, setInput, setOutput, setPending } = actions;


  useEffect(() => {
    worker.current = new Worker(new URL("../worker/summary.ts", import.meta.url), {
      type: "module",
    });
    return () => worker.current?.terminate();
  }, []);

  const prepareModel = async () => {
    setPending(true);
    const timestamp = performance.now();
    await new Promise(resolve => {
      const fn = (e: MessageEvent) => {
        if (e.data.type === "done") {
          worker.current?.removeEventListener("message", fn);
          resolve(e.data);
        } else if (e.data.type === "progress") {
          console.log("progress", e.data.data);
        }
      };
      worker.current?.addEventListener("message", fn);
      worker.current?.postMessage({ type: "prepareModel" });
    });
    setPrepareModelTime(performance.now() - timestamp);
    setIsModelReady(true);
    setPending(false);
  };

  const generateSummary = async () => {
    setPending(true);
    const timestamp = performance.now();
    const summary = await new Promise(resolve => {
      worker.current?.addEventListener("message", e => {
        switch (e.data.type) {
          case "success":
            resolve(e.data.data);
            break;
          default:
            break;
        }
      });
      worker.current?.postMessage({ type: "run", text: input });
    });
    setPendingTime(performance.now() - timestamp);
    setOutput(summary as string);
    setPending(false);
  };

  return (
    <>
      <Card className="w-full max-w-6xl">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-full h-96 aspect-auto bg-muted rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
              <Textarea className="w-full h-full" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <div className="w-full h-96 aspect-auto bg-muted rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
              <Textarea className="w-full h-full" value={output} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
      <ModelControls
        isModelReady={isModelReady}
        pending={pending}
        prepareModelTime={prepareModelTime}
        pendingTime={pendingTime}
        onPrepareModel={prepareModel}
        onGenerate={generateSummary}
      />
    </>
  );
}
