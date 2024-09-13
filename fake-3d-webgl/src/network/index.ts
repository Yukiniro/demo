/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import { sleep } from "../utils";

const BASE_URL = import.meta.env.DEV ? "https://www.smartvideomaker.com" : "";

export async function generateDepthImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/ai/depth-map`, {
    method: "POST",
    body: formData,
  });
  const { code, data, msg } = await res.json();

  if (code === 200) {
    const eventId = data.event_id;
    const startTime = performance.now();
    while (true) {
      // 3 分钟超时
      if (performance.now() - startTime > 1000 * 60 * 3) {
        throw new Error("Timeout!");
      }
      const res = await fetch(`${BASE_URL}/rp/get-state?event_id=${eventId}`);
      const { code, data, msg } = await res.json();
      if (code === 200) {
        const { job_state, out_put } = data;
        if (job_state === "failed") {
          throw new Error("Failed!");
        }
        if (job_state === "succeeded") {
          const { result } = out_put[0];
          // 测试服务器的 result 是图片的 url
          // 正式服务器的 result 是图片的 id，需要拼接地址
          // const url = `${BASE_URL}/ai/export/img2img/result/${result}`;
          const img = await fetch(result);
          const blob = await img.blob();
          return blob;
        }
        await sleep(100);
      } else {
        throw new Error(msg);
      }
    }
  } else {
    throw new Error(msg);
  }
}
