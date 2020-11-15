import React, { useContext } from 'react';
import Workspaces from "@glue42/workspaces-ui-react";
import { GlueContext } from "@glue42/react-hooks";
import "@glue42/workspaces-ui-react/dist/styles/popups.css";
import "@glue42/workspaces-ui-react/dist/styles/goldenlayout-base.css";
import "@glue42/workspaces-ui-react/dist/styles/glue42-theme.css";
import "./index.css";

const App = () => {
  const glue = useContext(GlueContext);
  (window as any).glue = glue;
  return (
    <Workspaces />
  );
}

export default App;
