import { useState, useEffect, useRef, useMemo } from "react";
import { FileInfo } from "./file-info";

export function InputFS() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
  };

  const fileUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : "";
  }, [file]);

  useEffect(() => {
    // 直接在 DOM 元素上设置 webkitdirectory 属性
    // if (inputRef.current) {
    //   inputRef.current.setAttribute("webkitdirectory", "");
    //   inputRef.current.setAttribute("directory", ""); // 为了更好的兼容性
    // }
  }, []);

  return (
    <div>
      <input onChange={handleChange} ref={inputRef} type="file" className="border border-black p-2" />
      <FileInfo file={file} />
      {fileUrl && (
        <a href={fileUrl} download={file?.name}>
          Download
        </a>
      )}
    </div>
  );
}
