import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MemberstackProvider } from "@memberstack/react";
const config = {
  publicKey: "pk_sb_bb958432b1cf47aff84b",
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MemberstackProvider config={config}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MemberstackProvider>
);
