import { createAction, handleActions } from 'redux-actions';
import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

const fireRef = new Firebase(FIREBASE);

// ------------------------------------
// Constants
// ------------------------------------
const REG_AUTH_LISTENER = 'REG_AUTH_LISTENER';
const VOID_AUTH_LISTENER = 'VOID_AUTH_LISTENER';

const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';

const USER_SAVE_REQUEST = 'USER_SAVE_REQUEST';
const USER_SAVE_SUCCESS = 'USER_SAVE_SUCCESS';
const USER_SAVE_ERROR = 'USER_SAVE_ERROR';

const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// ------------------------------------
// Actions
// ------------------------------------
const regListener =
  createAction(REG_AUTH_LISTENER, (name, ref) => ({name, ref}));
const voidListener =
  createAction(VOID_AUTH_LISTENER, () => {});

const loginRequest = createAction(LOGIN_REQUEST, () => null);
const loginSuccess = createAction(LOGIN_SUCCESS, (authData) => authData);
const loginError = createAction(LOGIN_ERROR, (error) => error);

const userSaveRequest = createAction(USER_SAVE_REQUEST, (authData) => authData);
const userSaveSuccess = createAction(USER_SAVE_SUCCESS, (val) => val);
const userSaveError = createAction(USER_SAVE_ERROR, (error) => error);

const logoutSuccess = createAction(LOGOUT_SUCCESS, () => null);

// ------------------------------------
// Thunks
// ------------------------------------

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

const authListener = () => {
  return (dispatch, getState) => {
    dispatch(regListener('auth', fireRef));
    fireRef.onAuth(
      (authData) => {
        if (!authData) {
          dispatch(logoutSuccess());
          return;
        }

        dispatch(loginSuccess(authData));

        // save user to database
        dispatch(userSaveRequest(authData));
        const userRef = fireRef.child('users').child(authData.uid);
        userRef.set({
          provider: 'facebook',
          name: authData.facebook.displayName
        });
        userRef.once('value',
          (snapshot) => {
            const val = snapshot.val();
            dispatch(userSaveSuccess(val));
          }, (error) => {
            dispatch(userSaveError(error));
          });
      });
  };
};

const voidAuthListener = () => {
  return (dispatch, getState) => {
    const listeners = getState().auth.listeners;
    Object.keys(listeners).forEach((name) => {
      // turn off each listeners
      listeners[name].off();
    });
    dispatch(voidListener());
  };
};

const logout = () => {
  return (dispatch, getState) => fireRef.unauth();
};

export const actions = {
  loginAsync,
  logout,
};

export const listeners = {
  authListener,
  voidAuthListener,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [REG_AUTH_LISTENER]: (state, {payload}) => {
    return {
      ...state,
      listeners: {
        ...state.listeners,
        [payload.name]: payload.ref,
      },
    };
  },

  [VOID_AUTH_LISTENER]: (state, {payload}) => {
    return {
      ...state,
      listeners: {},
    };
  },

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
      _login: {
        ...state._login,
        loading: false,
      },
      authData: null,
    };
  }

}, {
  // default state
  listeners: {},

  _login: {
    loading: true,
    error: null
  },
  authData: null
});
