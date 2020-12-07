import React, { useContext } from 'react';
import Workspaces from "@glue42/workspaces-ui-react";
import "@glue42/workspaces-ui-react/dist/styles/popups.css";
import "@glue42/workspaces-ui-react/dist/styles/goldenlayout-base.css";
import "@glue42/workspaces-ui-react/dist/styles/glue42-theme.css";
import "./index.css";
import { GlueContext } from '@glue42/react-hooks';

const App = () => {
    (window as any).glue = useContext(GlueContext);
    return (
        <Workspaces />
    );
}

export default App;
