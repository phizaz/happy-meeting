import configureStore from 'redux/configureStore';

import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';

const historyConfig = { basename: __BASENAME__ };
const history = useRouterHistory(createHistory)(historyConfig);

const initialState = window.__INITIAL_STATE__;
const store = configureStore({ initialState, history });

export const dispatch = store.dispatch;
export const getState = store.getState;

export default store;

