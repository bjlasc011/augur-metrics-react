import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AugurMetrics from './AugurMetrics';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AugurMetrics />, document.getElementById('root'));
registerServiceWorker();
