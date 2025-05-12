import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { FlightProvider } from "./lib/context/FlightContext";

createRoot(document.getElementById("root")!).render(
  <FlightProvider>
    <App />
  </FlightProvider>
);
