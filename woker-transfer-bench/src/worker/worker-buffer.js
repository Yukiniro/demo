onmessage = function (e) {
  const buffer = new Uint8Array(1024 * 1024 * 50);
  switch (e.data.type) {
    case "start":
      postMessage(
        {
          type: "done",
          data: buffer,
        },
        [buffer.buffer],
      );
      break;
  }
};
