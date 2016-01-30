import { createAction, handleActions } from 'redux-actions';
import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

const fireRef = new Firebase(FIREBASE);
// ------------------------------------
// Constants
// ------------------------------------
const HOME_NAME_CHANGE = 'HOME_NAME_CHANGE';
const HOME_TITLE_CHANGE = 'HOME_TITLE_CHANGE';

const CREATE_REQUEST = 'CREATE_REQUEST';
const CREATE_SUCCESS = 'CREATE_SUCCESS';
const CREATE_ERROR = 'CREATE_ERROR';

// ------------------------------------
// Actions
// ------------------------------------

const homeNameChange =
  createAction(HOME_NAME_CHANGE, (name) => name);
const homeTitleChange =
  createAction(HOME_TITLE_CHANGE, (title) => title);

const createRequest =
  createAction(CREATE_REQUEST, (name, title) => {
    return { name, title };
  });
const createSuccess =
  createAction(CREATE_SUCCESS, (questionData) => questionData);
const createError =
  createAction(CREATE_ERROR, (error) => error);

const createAsync = (name, title) => {
  return (dispatch, getState) => {
    const authData = getState().auth.authData;
    const questionRef = fireRef.child('questions').child(name);

    return new Promise((resolve, reject) => {
      dispatch(createRequest(name, title));

      const doesntExist = (ref) => {
        // check if the question exists
        return new Promise((resolve, reject) => {
          questionRef.once('value', (snapshot) => {
            const val = snapshot.val();
            if (val) {
              reject();
            } else {
              resolve();
            }
          });
        });
      };

      doesntExist(questionRef)
        .then(() => {
          console.log('create a new question');
          // create a new question
          questionRef.set({
            name,
            title,
            owner: authData.uid,
            valid: true,
            startTime: new Date().getTime(),
            duration: 2 * 24 * 3600,
            labels: ['morning', 'afternoon', 'evening'],

            structure: [0, 1, 2, 3, 4, 5, 6].map(x => {
              return {
                date: x,
                periods: [0, 0, 0]
              };
            }),

            participants: {}
          });

          questionRef.once('value', (snapshot) => {
            const val = snapshot.val();
            dispatch(createSuccess(val));
            resolve(val);
          });
        })
        .catch(() => {
          dispatch(createError('duplicate question eiei'));
          reject('duplicate question eiei');
        });
    });
  };
};

export const actions = {
  homeNameChange,
  homeTitleChange,
  createAsync
};

export const listeners = {
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
