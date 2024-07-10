import { Button } from "@/components/ui/button";

const fn = () => {
  window.open(
    "https://www.baidu.com",
    "_blank",
    "height=600,width=600,status=yes,top=200,left=400,toolbar=no,menubar=no,location=no",
  );
};

function App() {
  const handleClick = () => {
    fn();
  };
  const handleClickAsync = () => {
    setTimeout(() => {
      fn();
    }, 1000);
  };
  return (
    <div className="flex items-center justify-center flex-col w-full h-full">
      <h1 className="text-6xl mb-32">React + Vite + Shadcn</h1>
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
