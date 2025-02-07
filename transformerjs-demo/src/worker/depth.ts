import { pipeline } from "@huggingface/transformers";

let processor: unknown = null;

self.addEventListener("message", async event => {
  try {
    switch (event.data.type) {
      case "prepareModel": {
        processor = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
          device: "webgpu",
          dtype: "fp16",
        });
        self.postMessage({ type: "done" });
        break;
      }
      case "run": {
        if (!processor) {
          throw new Error("Model or processor not prepared");
        }
        const url = event.data.url;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const { depth } = await processor(url);
        const canvas = depth.toCanvas();
        const bitmap = await createImageBitmap(canvas);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        self.postMessage({ type: "success", data: bitmap }, [bitmap]);
        break;
      }
    }
  } catch (error) {
    self.postMessage({ type: "error", data: (error as Error).message });
  }
});
