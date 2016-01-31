import history from './history';
import configureStore from './redux/configureStore';
const initialState = window.__INITIAL_STATE__;

const store = configureStore({ initialState, history });

export const dispatch = store.dispatch;
export const getState = store.getState;
export default store;
