import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { setupFetchInterceptor } from "./lib/setupFetchInterceptor";

// Install global 401 → /login redirect before the React tree mounts
setupFetchInterceptor();

createRoot(document.getElementById("root")!).render(<App />);
