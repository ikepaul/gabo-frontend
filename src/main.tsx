import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CardThemeProvider } from "./contexts/CardThemeContext.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <CardThemeProvider>
        <App />
      </CardThemeProvider>
    </UserProvider>
  </React.StrictMode>
);
