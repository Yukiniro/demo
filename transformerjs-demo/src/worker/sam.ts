import { AutoProcessor, Processor, SamModel, RawImage, SamPreTrainedModel, Tensor } from "@huggingface/transformers";

let model: SamPreTrainedModel | null = null;
let processor: Processor | null = null;
let image_inputs: unknown;
let image_embeddings: unknown;

self.addEventListener("message", async event => {
  try {
    switch (event.data.type) {
      case "prepareModel": {
        const device = event.data.device;
        const options: {
          device: "webgpu" | "wasm";
          dtype: "fp16" | "q8";
        } = device === "webgpu" ? { device: "webgpu", dtype: "fp16" } : { device: "wasm", dtype: "q8" };
        model = await SamModel.from_pretrained("Xenova/slimsam-77-uniform", {
          ...options,
        });
        processor = await AutoProcessor.from_pretrained("Xenova/slimsam-77-uniform", {});
        self.postMessage({ type: "done" });
        break;
      }
      case "segment": {
        if (!processor || !model) {
          throw new Error("Model or processor not prepared");
        }
        const url = event.data.url;
        const image = await RawImage.read(url);
        image_inputs = await processor(image);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        image_embeddings = await model.get_image_embeddings(image_inputs);

        // Indicate that we have computed the image embeddings, and we are ready to accept decoding requests
        self.postMessage({
          type: "segment_result",
          data: "done",
        });
        break;
      }
      case "run": {
        if (!processor || !model) {
          throw new Error("Model or processor not prepared");
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        if (!image_inputs || !image_embeddings) {
          throw new Error("Image embeddings not computed");
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const reshaped = image_inputs.reshaped_input_sizes[0];
        const points = event.data.points.map((point: number[]) => [point[0] * reshaped[1], point[1] * reshaped[0]]);
        const input_points = new Tensor("float32", points.flat(Infinity), [1, 1, points.length, 2]);
        const labels = event.data.points.map(() => BigInt(1));
        const input_labels = new Tensor("int64", labels.flat(Infinity), [1, 1, labels.length]);

        const outputs = await model({
          ...image_embeddings,
          input_points,
          input_labels,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const masks = await processor.post_process_masks(
          outputs.pred_masks,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          image_inputs.original_sizes,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          image_inputs.reshaped_input_sizes,
        );

        const scores = outputs.iou_scores.data;
        const numMasks = scores.length;

        let bestIndex = 0;
        for (let i = 1; i < numMasks; ++i) {
          if (scores[i] > scores[bestIndex]) {
            bestIndex = i;
          }
        }

        const mask = RawImage.fromTensor(masks[0][0]);
        const canvas = new OffscreenCanvas(mask.width, mask.height);
        const ctx = canvas.getContext("2d");
        const imageData = ctx!.createImageData(canvas.width, canvas.height);
        const pixelData = imageData.data;
        for (let i = 0; i < pixelData.length; ++i) {
          if (mask.data[numMasks * i + bestIndex] === 1) {
            const offset = 4 * i;
            pixelData[offset] = 0; // red
            pixelData[offset + 1] = 114; // green
            pixelData[offset + 2] = 189; // blue
            pixelData[offset + 3] = 255; // alpha
          }
        }

        ctx!.putImageData(imageData, 0, 0);
        const imagebitmap = await createImageBitmap(canvas);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        self.postMessage({ type: "success", data: imagebitmap }, [imagebitmap]);
        break;
      }
    }
  } catch (error) {
    self.postMessage({ type: "error", data: (error as Error).message });
  }
});
