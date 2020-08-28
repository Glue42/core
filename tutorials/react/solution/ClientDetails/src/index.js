import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GlueWeb from "@glue42/web";
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import ClientDetails from './ClientDetails';
import GlueWorkspaces from '@glue42/workspaces-api';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <GlueProvider config={{ channels: true, appManager: true, application: 'Client Details', libraries: [GlueWorkspaces] }} glueFactory={GlueWeb}>
    <ClientDetails />
  </GlueProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
