import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
// eslint-disable-next-line camelcase
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";

const rootReducer = (state = { count: 0 }, action: { type: string; [key: string]: unknown }) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
