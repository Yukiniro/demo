import { pipeline } from "@huggingface/transformers";

let processor: unknown = null;

self.addEventListener("message", async event => {
  try {
    switch (event.data.type) {
      case "prepareModel": {
        processor = await pipeline("summarization", "Falconsai/text_summarization", {
          device: "webgpu",
        });
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
    console.error(error);
  }
});
