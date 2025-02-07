import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function useModelWorker(workerUrl: string) {
  const worker = useRef<Worker | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    worker.current = new Worker(new URL(workerUrl, import.meta.url), {
      type: "module",
    });
    worker.current?.addEventListener("message", e => {
      if (e.data.type === "error") {
        console.error(e.data.data);
        toast({
          title: "Error",
          description: e.data.data,
        });
      }
    });
    return () => worker.current?.terminate();
  }, [toast, worker, workerUrl]);

  return worker;
}
