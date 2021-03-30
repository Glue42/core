import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GlueProvider } from '@glue42/react-hooks';
import Glue, { Glue42 } from "@glue42/desktop";
import GlueWeb, { Glue42Web } from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";

// import GlueWebPlatform from "@glue42/web-platform";

declare const window: Window & { glue42gd: any };

ReactDOM.render(
  <React.StrictMode>
    <GlueProvider glueFactory={(config: any) => {

      // const layouts = {
      //   mode: "session",
      //   local: [
      //     { "name": "example2", "type": "Workspace", "components": [{ "type": "Workspace", "state": { "config": { "name": "second", "title": "Untitled 1" }, "context": {}, "children": [{ "type": "column", "config": {}, "children": [{ "type": "row", "config": {}, "children": [{ "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne", "title": "asd" } }] }, { "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne" } }] }] }, { "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne" } }] }] }] } }], "metadata": {} },
      //     { "name": "not-example", "type": "Workspace", "components": [{ "type": "Workspace", "state": { "config": { "name": "second", "title": "Untitled 1" }, "context": {}, "children": [{ "type": "column", "config": {}, "children": [{ "type": "row", "config": {}, "children": [{ "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne" } }] }, { "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne" } }] }] }, { "type": "group", "config": {}, "children": [{ "type": "window", "config": { "appName": "SimpleOne" } }] }] }] } }], "metadata": {} },
      //     {
      //       "name": "asd",
      //       "type": "Workspace",
      //       "metadata": {},
      //       "components": [
      //         {
      //           "type": "Workspace",
      //           "state": {
      //             "config": {
      //               "name": "asd",
      //               "title": "Untitled 1"
      //             },
      //             "context": null,
      //             "children": [
      //               {
      //                 "type": "column",
      //                 "config": {},
      //                 "children": [
      //                   {
      //                     "type": "group",
      //                     "config": {},
      //                     "children": [
      //                       {
      //                         "type": "window",
      //                         "config": {
      //                           "appName": "SimpleOne"
      //                         }
      //                       }
      //                     ]
      //                   }
      //                 ]
      //               }
      //             ]
      //           }
      //         }
      //       ]
      //     }
      //   ]
      // };

      // const applications = {
      //   local: [
      //     {
      //       name: "SimpleOne",
      //       type: "window",
      //       title: "maybe",
      //       details: {
      //         url: "http://localhost:9200/"
      //       },
      //       customProperties: {
      //         includeInWorkspaces: true
      //       }
      //     }
      //   ]
      // }

      // const platformConfig = {
      //   glue: {
      //     libraries: [GlueWorkspaces],
      //     systemLogger: { level: "trace" }
      //   },
      //   applications,
      //   layouts,
      //   workspaces: {
      //     src: "/",
      //     isFrame: true
      //   }
      // };

      // return GlueWebPlatform(platformConfig as any).then((data) => data.glue) as any;

      return window.glue42gd ?
        Glue(Object.assign(config, { libraries: [GlueWorkspaces], appManager: "skipIcons" }) as Glue42.Config) :
        GlueWeb(Object.assign(config, { libraries: [GlueWorkspaces] }) as Glue42Web.Config) as any
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
