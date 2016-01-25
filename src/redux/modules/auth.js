import { createAction, handleActions } from 'redux-actions';
import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

const fireRef = new Firebase(FIREBASE);

// ------------------------------------
// Constants
// ------------------------------------
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// ------------------------------------
// Actions
// ------------------------------------
export const loginRequest = createAction(LOGIN_REQUEST, () => null);
export const loginSuccess = createAction(LOGIN_SUCCESS, (authData) => authData);
export const loginError = createAction(LOGIN_ERROR, (error) => new Error(error));

export const loginAsync = () => {
  return (dispatch, getState) => {
    dispatch(loginRequest());

    return new Promise(
      (resolve, reject) => {
        fireRef.authWithOAuthPopup('facebook', function (error, authData) {
          if (error) {
            dispatch(loginError(error));
            reject(error);
          } else {
            dispatch(loginSuccess(authData));
            resolve(authData);
          }
        });
      });
  };
};

export const logoutRequest = createAction(LOGOUT_REQUEST, () => null);
export const logoutSuccess = createAction(LOGOUT_SUCCESS, () => null);

export const logout = () => {
  return (dispatch, getState) => {
    dispatch(logoutRequest());

    fireRef.unauth();
    dispatch(logoutSuccess());
  };
};

export const actions = {
  loginAsync,
  logout
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [LOGIN_REQUEST]: (state, { payload }) => {
    return {
      ...state,
      _login: {
        ...state._login,
        loading: true
      }
    };
  },

  [LOGIN_SUCCESS]: (state, { payload }) => {
    return {
      ...state,
      _login: {
        ...state._login,
        loading: false
      },
      authData: payload
    };
  },

  [LOGIN_ERROR]: (state, { payload }) => {
    return {
      ...state,
      _login: {
        ...state._login,
        loading: false
      },
      error: payload
    };
  },

  [LOGOUT_SUCCESS]: (state, { payload }) => {
    return {
      ...state,
      authData: null
    };
  }

}, {
  // default state
  _login: {
    loading: false,
    error: null
  },
  authData: null
});
