import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GlueProvider } from '@glue42/react-hooks';
import Glue, { Glue42 } from "@glue42/desktop";
import GlueWeb, { Glue42Web } from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";

declare const window: Window & { glue42gd: any };

ReactDOM.render(
  <React.StrictMode>
    <GlueProvider glueFactory={(config: Glue42.Config | Glue42Web.Config | undefined) => {
      return window.glue42gd ?
        Glue(Object.assign(config, { libraries: [GlueWorkspaces], appManager: "skipIcons" }) as Glue42.Config) :
        GlueWeb(Object.assign(config, { application: "Workspaces", libraries: [GlueWorkspaces], appManager: true }) as Glue42Web.Config)
    }}>
      <App />
    </GlueProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
