import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Clients from './Clients';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Clients />, document.getElementById('root'));

serviceWorker.register();
