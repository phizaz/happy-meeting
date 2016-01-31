import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';

import configureStore from './configureStore';

const historyConfig = { basename: __BASENAME__ };

export const history = useRouterHistory(createHistory)(historyConfig);

const initialState = window.__INITIAL_STATE__;

console.log('initialState:', initialState);

export const store = configureStore({ initialState, history });

export const dispatch = store.dispatch;
export const getState = store.getState;

console.log('getState:', getState());
