import { useSelector, useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const count = useSelector((state: { count: number }) => state.count);

  const handleIncrement = () => {
    dispatch({ type: "INCREMENT" });
  };
  const handleDecrement = () => {
    dispatch({ type: "DECREMENT" });
  };

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">Redux</h1>
      <p>count: {count}</p>
      <div>
        <button className="btn" onClick={handleDecrement}>
          - 1
        </button>
        <button className="btn" onClick={handleIncrement}>
          + 1
        </button>
      </div>
    </div>
  );
}

export default App;
