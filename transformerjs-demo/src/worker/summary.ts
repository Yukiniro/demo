import { pipeline } from "@huggingface/transformers";

let processor: unknown = null;

self.addEventListener("message", async event => {
  try {
    switch (event.data.type) {
      case "prepareModel": {
        const device = event.data.device;
        const options: {
          device: "webgpu" | "wasm";
          dtype?: "fp32" | "q8";
        } = device === "webgpu" ? { device: "webgpu", dtype: "fp32" } : { device: "wasm", dtype: "q8" };
        processor = await pipeline("summarization", "Falconsai/text_summarization", options);
        self.postMessage({ type: "done" });
        break;
      }
      case "run": {
        if (!processor) {
          throw new Error("Model or processor not prepared");
        }
        const text = event.data.text;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const output = await processor(text, {
          max_new_tokens: 100,
        });
        const summary = output.map((o: { summary_text: string }) => o.summary_text).join("\n");

        self.postMessage({ type: "success", data: summary });
        break;
      }
    }
  } catch (error) {
    self.postMessage({ type: "error", data: (error as Error).message });
  }
});
