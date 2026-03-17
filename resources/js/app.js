require("./bootstrap");

import React from "react";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout"; // ✅ your main layout file
import { CountProvider } from "./Context/CountContext"; // ✅ React Context for Dashboard counts

// ✅ Optional: React Router (if you use routing)
import { BrowserRouter as Router } from "react-router-dom";

// ✅ Mount React to the #app element in Blade
if (document.getElementById("app")) {
    const root = createRoot(document.getElementById("app"));
    root.render(
        <React.StrictMode>
            <CountProvider>
                {/* Optional: Router wrapper (if you have navigation between pages) */}
                <Router>
                    <Layout />
                </Router>
            </CountProvider>
        </React.StrictMode>
    );
}