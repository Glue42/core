import React, { useContext } from 'react';
import Workspaces from "@glue42/workspaces-ui-react";
import "@glue42/workspaces-ui-react/dist/styles/popups.css";
import "@glue42/workspaces-ui-react/dist/styles/goldenlayout-base.css";
import "@glue42/workspaces-ui-react/dist/styles/glue42-theme.css";
import "./index.css";
import { GlueContext } from '@glue42/react-hooks';
// import { Glue42Workspaces } from '@glue42/workspaces-api';
// import { Glue42Web } from "@glue42/web";
// import { Glue42 } from "@glue42/desktop";

const App = () => {
    (window as any).glue = useContext(GlueContext);
    return (
        <Workspaces />
    );
}

// const App = () => {
//     const waitForMyFrame = (glue: Glue42Web.API | Glue42.Glue) => {
//         return new Promise<Glue42Workspaces.Frame>(async (res, rej) => {
//             const unsub = await glue.workspaces?.onFrameOpened((f) => {
//                 if (f.id === getFrameId()) {
//                     res(f);
//                     if (unsub) {
//                         unsub();
//                     }
//                 }
//             });
//             const frames = await glue.workspaces?.getAllFrames();
//             const myFrame = frames?.find(f => f.id === getFrameId());

//             if (myFrame) {
//                 res(myFrame);
//                 if (unsub) {
//                     unsub();
//                 }
//             }
//         });
//     };

//     useGlue(async (glue) => {
//         const myFrame = await waitForMyFrame(glue as any);
//         const wsp = (await myFrame.workspaces())[0];
//         const newWsp = await glue.workspaces?.restoreWorkspace("example2", {title: "example2", reuseWorkspaceId: wsp.id} as any);
//         await newWsp?.setTitle("Default");
//     });

//     return (
//         <Workspaces />
//     );
// }

export default App;
