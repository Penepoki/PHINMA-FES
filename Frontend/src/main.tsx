import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.tsx";

createRoot(document.querySelector("#root")!).render(
	<StrictMode>
		<App />
		{/* App is the main component of the application */}
	</StrictMode>,
);
