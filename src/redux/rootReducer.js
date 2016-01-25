import { combineReducers } from 'redux';
import { routeReducer as router } from 'redux-simple-router';

import auth from './modules/auth';
import home from './modules/home';

export default combineReducers({
  auth,
  home,
  router
});
