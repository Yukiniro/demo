
import { NextResponse } from "next/server";

export async function GET() {
  console.log("sse route called");
  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;
  const customReadable = new ReadableStream({
    start(controller) {
      let count = 0;
      interval = setInterval(() => {
        count++;
        let data = '';
        if (count > 5) {
          data = `data: { "count": ${count} } \n\n`;
        } else {
          data = `data: ${count}\n\n`;
        }
        controller.enqueue(encoder.encode(data));
      }, 1000);

       // 添加清理函数
       return () => {
        clearInterval(interval);
        controller.close();
      };
    },
    cancel(reason: string) {
      console.log("cancel", reason);
      clearInterval(interval);
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
