require("./bootstrap");

import React from "react";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout";
import { CountProvider } from "./Context/CountContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

if (document.getElementById("app")) {
    const root = createRoot(document.getElementById("app"));
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <CountProvider>
                    <Layout />
                </CountProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}