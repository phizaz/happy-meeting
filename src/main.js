import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';

import history from './historyConst.js';
import store from './store';
import routes from './routes';

// Render the React application to the DOM
ReactDOM.render(
  <Root history={history} routes={routes} store={store} />,
  document.getElementById('root')
);
