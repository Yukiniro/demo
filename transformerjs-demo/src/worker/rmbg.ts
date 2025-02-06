import { AutoModel, AutoProcessor, PreTrainedModel, Processor, RawImage } from "@huggingface/transformers";

let model: PreTrainedModel | null = null;
let processor: Processor | null = null;

self.addEventListener("message", async event => {
  try {
    switch (event.data.type) {
      case "prepareModel": {
        model = await AutoModel.from_pretrained("briaai/RMBG-1.4", {
          // Do not require config.json to be present in the repository
          // dtype: "q8",
          device: "webgpu",
          dtype: "fp16",
          progress_callback: value => {
            switch (value.status) {
              case "progress": {
                self.postMessage({ type: "progress", data: value.progress });
                break;
              }
            }
          },
        });
        processor = await AutoProcessor.from_pretrained("briaai/RMBG-1.4", {
          // Do not require config.json to be present in the repository
          config: {
            do_normalize: true,
            do_pad: false,
            do_rescale: true,
            do_resize: true,
            image_mean: [0.5, 0.5, 0.5],
            feature_extractor_type: "ImageFeatureExtractor",
            image_std: [1, 1, 1],
            resample: 2,
            rescale_factor: 0.00392156862745098,
            size: { width: 1024, height: 1024 },
          },
        });
        self.postMessage({ type: "done" });
        break;
      }
      case "run": {
        if (!model || !processor) {
          throw new Error("Model or processor not prepared");
        }
        const url = event.data.url;
        const image = await RawImage.fromURL(url);
        const { pixel_values } = await processor(image);
        const { output } = await model({ input: pixel_values });
        const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(image.width, image.height);

        const canvas = new OffscreenCanvas(mask.width, mask.height);
        const ctx = canvas.getContext("2d");

        // Draw original image output to canvas
        ctx!.drawImage(image.toCanvas(), 0, 0);

        const pixelData = ctx!.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < mask.data.length; ++i) {
          pixelData.data[4 * i + 3] = mask.data[i];
        }

        const bitmap = await createImageBitmap(pixelData);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        self.postMessage({ type: "success", data: bitmap }, [bitmap]);
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
});
