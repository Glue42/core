import React from 'react';
import ReactDOM from 'react-dom';
import '@glue42/web';
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Clients from './Clients';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <GlueProvider config={{ channels: true }}>
        <Clients />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
