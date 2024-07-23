import { dir, write, file } from "opfs-tools";
import { useEffect, useState } from "react";
import { InputFile } from "./components/input-file";
import { Skeleton } from "./components/ui/skeleton";
import { createFileTree, Directory, ToggleFileTree } from "react-toggle-file-tree";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

function App() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [dirPath, setDirPath] = useState("/");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const children = await dir("/").children();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const list = [];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const parseChildren = async (children, localPath) => {
        for (const child of children) {
          switch (child.kind) {
            case "dir":
              await parseChildren(await child.children(), child.path);
              break;
            case "file":
              list.push({
                localPath,
                fileName: child.name,
              });
              break;
          }
        }
      };

      await parseChildren(children, "/");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setFiles(list);
      setLoading(false);
    })();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const list: File[] = Array.from(fileList);
    const genPath = (file: File) => {
      return `${dirPath}/${file.name}`;
    };

    const promiseList = [];
    for (const item of list) {
      const path = genPath(item);
      if (await file(path).exists()) {
        continue;
      }
      promiseList.push(
        write(path, item.stream()).then(() => {
          return {
            localPath: dirPath || "/",
            fileName: item.name,
          };
        }),
      );
    }

    const newList = await Promise.all(promiseList);
    if (newList.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    setFiles([...files, ...newList]);
  };

  const handleDirChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDirPath(event.target.value);
  };

  const handleClear = async () => {
    await dir("/").remove();
    setFiles([]);
  };

  const handleFileClick = () => {
    console.log("handleFileClick");
  };
  const handleDirectoryClick = () => {
    console.log("handleDirectoryClick");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-col w-full h-full">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start flex-col w-full h-full">
      <h1 className="text-6xl py-16  w-full text-center font-mono font-bold">OPFS Demo</h1>
      <div>
        <Button className="mb-6 block ml-auto mr-auto" onClick={handleClear}>
          Clear
        </Button>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="text">Upload Dir</Label>
          <Input type="text" id="text" placeholder="Upload Dir" onChange={handleDirChange} value={dirPath} />
        </div>
        <InputFile onChange={handleFileChange} className="mb-6" />
      </div>
      <div className="w-full max-w-sm flex justify-start">
        <ToggleFileTree
          list={createFileTree(files) as Directory}
          handleFileClick={handleFileClick}
          handleDirectoryClick={handleDirectoryClick}
        />
      </div>
    </div>
  );
}

export default App;
