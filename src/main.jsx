import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SkeletonTheme } from "react-loading-skeleton";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SkeletonTheme baseColor="#1e293b" highlightColor="#334155">
      <App />
    </SkeletonTheme>
  </StrictMode>
);
