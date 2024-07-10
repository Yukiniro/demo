import { Button } from "@/components/ui/button";
import { useState } from "react";

function App() {
  const [link, setLink] = useState<string>("https://www.baidu.com");

  const handleClick = () => {
    window.open(link, "_blank", "height=600,width=600,status=yes,top=200,left=400,toolbar=no,menubar=no,location=no");
  };
  const handleClickAsync = () => {
    setTimeout(() => {
      window.open(link, "_blank", "height=600,width=600,status=yes,top=200,left=400,toolbar=no,menubar=no,location=no");
    }, 1000);
  };
  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32">React + Vite + Shadcn</h1>
      <input value={link} onChange={e => setLink(e.target.value)} />
      <div>
        <Button className="m-2" onClick={handleClick}>
          Click Me
        </Button>
        <Button className="m-2" onClick={handleClickAsync}>
          Click Me Async
        </Button>
      </div>
    </div>
  );
}

export default App;
