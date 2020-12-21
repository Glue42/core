import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import StockDetails from './StockDetails';
import * as serviceWorker from './serviceWorker';


ReactDOM.render(<StockDetails />, document.getElementById('root'));

serviceWorker.register();
