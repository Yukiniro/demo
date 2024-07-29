import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { FileInfo } from "./file-info";

export function PickerFS() {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!window.showOpenFilePicker) {
      alert("Your browser does not support the File System Access API");
    }
  });

  const handleChooseFile = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fileHandles = await window.showOpenFilePicker();
    const file = await fileHandles[0].getFile();
    setFile(file);
  };

  const handleChooseDirectory = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const directoryHandle = await window.showDirectoryPicker();
    const keys = directoryHandle.keys();
    for await (const key of keys) {
      console.log(key);
    }
  };

  const handleDownloadFile = async () => {
    const opts = {
      suggestedName: "test.txt",
      types: [
        {
          description: "Text file",
          accept: { "text/plain": [".txt"] },
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fileHandle = await window.showSaveFilePicker(opts);
    const writable = await fileHandle.createWritable();
    await writable.write("Hello, world!");
    await writable.close();
  };

  return (
    <div>
      <div>
        <Button className="m-2" onClick={handleChooseFile}>
          Choose File
        </Button>
        <Button onClick={handleChooseDirectory} className="m-2">
          Choose Directory
        </Button>
        <Button onClick={handleDownloadFile} className="m-2">
          Download File
        </Button>
      </div>
      <FileInfo file={file} />
    </div>
  );
}
