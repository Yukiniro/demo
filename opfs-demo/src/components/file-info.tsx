import { useMemo } from "react";

interface FileInfoProps {
  file: File | null;
}

export function FileInfo(props: FileInfoProps) {
  const { file } = props;
  const fileInfos = useMemo(() => {
    return file ? [`File name: ${file?.name}`, `File size: ${file?.size} bytes`, `File type: ${file?.type}`] : [];
  }, [file]);

  return (
    <ul className="mt-6">
      {fileInfos.map((info, index) => (
        <li key={index}>{info}</li>
      ))}
    </ul>
  );
}
