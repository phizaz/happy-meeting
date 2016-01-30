import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';

import routes from './routes';
import history from 'redux/history';
import store from 'redux/store';

// Render the React application to the DOM
ReactDOM.render(
  <Root history={history} routes={routes} store={store} />,
  document.getElementById('root')
);
