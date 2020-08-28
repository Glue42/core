import React from 'react';
import ReactDOM from 'react-dom';
import GlueWeb from "@glue42/web";
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import StockDetails from './StockDetails';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <GlueProvider config={{ channels: true, appManager: true, application: 'Stock Details' }} glueFactory={GlueWeb}>
        <StockDetails />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
