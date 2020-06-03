import React from "react";
import ReactDOM from "react-dom";
import "@glue42/web";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import "./App.css";
import App from "./App";
import { GlueProvider } from '@glue42/react-hooks';
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <GlueProvider config={{ channels: true }}>
    <App />
  </GlueProvider>,
  document.getElementById("root")
);

serviceWorker.register();
