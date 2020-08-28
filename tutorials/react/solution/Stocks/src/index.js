import React from 'react';
import ReactDOM from 'react-dom';
import GlueWeb from "@glue42/web";
import { GlueProvider } from '@glue42/react-hooks';
import GlueWorkspaces from '@glue42/workspaces-api';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Stocks from './Stocks';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <GlueProvider config={{ channels: true, appManager: true, application: 'Stocks', libraries: [GlueWorkspaces] }} glueFactory={GlueWeb}>
        <Stocks />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
