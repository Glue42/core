import React from 'react';
import ReactDOM from 'react-dom';
import GlueWeb from "@glue42/web";
import { GlueProvider } from '@glue42/react-hooks';
import GlueWorkspaces from '@glue42/workspaces-api';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Clients from './Clients';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <GlueProvider config={{ channels: true, appManager: true, application: 'Clients', libraries: [GlueWorkspaces] }} glueFactory={GlueWeb}>
        <Clients />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
