import { createAction, handleActions } from 'redux-actions';
import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

const fireRef = new Firebase(FIREBASE);

// ------------------------------------
// Constants
// ------------------------------------
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';

const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// ------------------------------------
// Actions
// ------------------------------------
const loginRequest = createAction(LOGIN_REQUEST, () => null);
const loginSuccess = createAction(LOGIN_SUCCESS, (authData) => authData);
const loginError = createAction(LOGIN_ERROR, (error) => new Error(error));

const loginAsync = () => {
  return (dispatch, getState) => {
    dispatch(loginRequest());

    return new Promise(
      (resolve, reject) => {
        fireRef.authWithOAuthPopup('facebook', function (error, authData) {
          if (error) {
            dispatch(loginError(error));
            reject(error);
          } else {
            // listener will handle this
            // dispatch(loginSuccess(authData));
            resolve(authData);
          }
        });
      });
  };
};

const loginListener = () => {
  return (dispatch, getState) => {
    fireRef.onAuth(
      (authData) => {
        dispatch(loginSuccess(authData));
      });
  };
};

const logoutSuccess = createAction(LOGOUT_SUCCESS, () => null);

const logout = () => {
  return (dispatch, getState) => {
    fireRef.unauth();
    dispatch(logoutSuccess());
  };
};

export const actions = {
  loginAsync,
  logout
};

export const listeners = {
  loginListener
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
