import { InputFile } from "./input-file";

export function OpFs() {
  const handleChooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    const file = fileList && fileList[0];
    if (!file) return;

    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(file.name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  };

  return <InputFile onChange={handleChooseFile} />;
}
