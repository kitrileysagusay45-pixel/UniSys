import React from "react";
import { createRoot } from "react-dom/client";
const App = () => <h1 style={{color: "black", padding: "50px", textAlign: "center"}}>Hello World - Pipeline Works!</h1>;
const container = document.getElementById("app");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("No #app container found for test_app");
}
