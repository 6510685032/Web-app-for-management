import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);