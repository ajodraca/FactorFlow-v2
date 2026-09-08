import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Shell } from "./app/shell";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element not found");
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>,
);
