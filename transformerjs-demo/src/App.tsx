import ViewRMBG from "@/components/view-rmbg";

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Transformers.js</h1>
        </div>
        <ViewRMBG />
      </div>
    </>
  );
}

export default App;
