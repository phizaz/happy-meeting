import { createAction, handleActions } from 'redux-actions';

import { actions as authActions } from 'redux/modules/auth';
// ------------------------------------
// Constants
// ------------------------------------
export const HOME_NAME_CHANGE = 'HOME_NAME_CHANGE';
export const HOME_TITLE_CHANGE = 'HOME_TITLE_CHANGE';

export const CREATE_REQUEST = 'CREATE_REQUEST';
export const CREATE_SUCCESS = 'CREATE_SUCCESS';
export const CREATE_ERROR = 'CREATE_ERROR';

// ------------------------------------
// Actions
// ------------------------------------

export const homeNameChange =
  createAction(HOME_NAME_CHANGE, (name) => name);
export const homeTitleChange =
  createAction(HOME_TITLE_CHANGE, (title) => title);

export const createRequest =
  createAction(CREATE_REQUEST, (name, title) => {
    return { name, title };
  });
export const createSuccess =
  createAction(CREATE_SUCCESS, (name) => name);
export const createError =
  createAction(CREATE_ERROR, (error) => new Error(error));

export const createAsync = () => {
  return (dispatch, getState) => {
    dispatch(createRequest());

    return new Promise(
      (resolve, reject) => {
        authActions.loginAsync()
          .then(() => {

            // do the create request here !!!

          });
      });
  };
};

export const actions = {
  homeNameChange,
  homeTitleChange,
  createAsync
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [HOME_NAME_CHANGE]: (state, { payload }) => {
    return {
      ...state,
      name: payload
    };
  },

  [HOME_TITLE_CHANGE]: (state, { payload }) => {
    return {
      ...state,
      title: payload
    };
  },

  [CREATE_REQUEST]: (state, { payload }) => {
    return {
      ...state,
      _create: {
        ...state._create,
        loading: true,
        name: payload.name,
        title: payload.title
      }
    };
  },

  [CREATE_SUCCESS]: (state, { payload }) => {
    return {
      ...state,
      _create: {
        ...state._create,
        loading: false
      }
    };
  },

  [CREATE_ERROR]: (state, { payload }) => {
    return {
      ...state,
      _create: {
        ...state._create,
        loading: false,
        error: payload
      }
    };
  }

}, {
  // default state
  _create: {
    loading: false,
    error: null,
    name: null,
    title: null,
  },
  name: null,
  title: null
});
