import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Stocks from './Stocks';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Stocks />, document.getElementById('root'));

serviceWorker.register();
