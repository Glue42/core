import React from 'react';
import ReactDOM from 'react-dom';
import '@glue42/web';
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Stocks from './Stocks';
import StockDetails from './StockDetails';
import * as serviceWorker from './serviceWorker';

const { href } = window.location;

const App = href.includes('details') ? StockDetails : Stocks;

ReactDOM.render(
    <GlueProvider>
        <App />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
