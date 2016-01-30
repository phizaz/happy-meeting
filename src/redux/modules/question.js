import { createAction, handleActions } from 'redux-actions';
import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

const fireRef = new Firebase(FIREBASE);
// ------------------------------------
// Constants
// ------------------------------------
const REG_QUESTION_LISTENER = 'REG_QUESTION_LISTENER';
const VOID_QUESTION_LISTENER = 'VOID_QUESTION_LISTENER';

const JOIN_REQUEST = 'JOIN_REQUEST';
const JOIN_SUCCESS = 'JOIN_SUCCESS';
const JOIN_ERROR = 'JOIN_ERROR';

const VOTE_REQUEST = 'VOTE_REQUEST';
const QUESTION_UPDATE = 'QUESTION_UPDATE';

// ------------------------------------
// Actions
// ------------------------------------
const regListener =
  createAction(REG_QUESTION_LISTENER, (name, ref) => ({name, ref}));
const voidListener =
  createAction(VOID_QUESTION_LISTENER, () => {});

const joinRequest =
  createAction(JOIN_REQUEST, (name) => name);
const joinSuccess =
  createAction(JOIN_SUCCESS, (questionData, votes) => ({questionData, votes}));
const joinError =
  createAction(JOIN_ERROR, (error) => error);

const voteRequest =
  createAction(VOTE_REQUEST, (question, votes) => ({question, votes}));
const questionUpdate =
  createAction(QUESTION_UPDATE, (questionData) => questionData);

const joinAsync = (name) => {
  return (dispatch, getState) => {
    const authData = getState().auth.authData;
    const questionRef = fireRef.child('questions').child(name);

    return new Promise((resolve, reject) => {
      dispatch(joinRequest(name));

      const doesExist = (ref) => {
        // check if the question exists
        return new Promise((resolve, reject) => {
          questionRef.once('value', (snapshot) => {
            const val = snapshot.val();
            if (val) {
              resolve(val);
            } else {
              reject();
            }
          });
        });
      };

      doesExist(questionRef)
        .then((questionData) => {
          console.log('join a question', questionData);
          // join a new question, and assign the default vote value
          const votesRef = questionRef.child('participants').child(authData.uid);
          votesRef.set({
            votes: questionData.structure.map(x => {
              return {
                periods: x.periods
              };
            })
          });

          const getQuestionData = () => {
            return new Promise((resolve, reject) => {
              questionRef.once('value', (snapshot) => {
                resolve(snapshot.val());
              });
            });
          };

          const getVotesData = () => {
            return new Promise((resolve, reject) => {
              votesRef.once('value', (snapshot) => {
                resolve(snapshot.val());
              });
            });
          };

          Promise.all([getQuestionData(), getVotesData()])
            .then((values) => {
              dispatch(joinSuccess(...values));
              resolve(values);
            });
        })
        .catch(() => {
          dispatch(joinError('question not found'));
          reject('question not found');
        });
    });
  };
};

const vote = (question, votes) => {
  return (dispatch, getState) => {
    dispatch(voteRequest(votes));
    const authData = getState().auth.authData;
    const ref =
      fireRef
        .child('questions')
        .child(question)
        .child('participants')
        .child(authData.uid)
        .child('votes');
    ref.set(votes);
  };
};

const questionListener = (authData, question) => {
  return (dispatch, getState) => {
    const ref =
      fireRef
        .child('questions')
        .child(question);
    dispatch(regListener('question', ref));
    ref.on('value', (snapshot) => {
      dispatch(questionUpdate(snapshot.val()));
    });
  };
};

const voidQuestionListener = () => {
  return (dispatch, getState) => {
    const listeners = getState().question.listeners;
    Object.keys(listeners).forEach((name) => {
      // turn off each listeners
      listeners[name].off();
    });
    dispatch(voidListener());
  };
};

export const actions = {
  joinAsync,
  vote,
};

export const listeners = {
  questionListener,
  voidQuestionListener,
};

// ------------------------------------
// Reducer
// ------------------------------------
const calculateScore = (structure, participants) => {
  // [[0, 0, 0], [0, 1, 2]] => avg => [0, 0.5, 1]
  const avg = (arr) => {
    const result = [];
    for (let j = 0; j < arr[0].length; ++j) {
      let sum = 0;
      for (let i = 0; i < arr.length; ++i) {
        sum += arr[i][j];
      }
      result.push(sum / arr.length);
    }
    return result;
  };
  const allDates = Object.keys(structure);
  const result = {};
  for (let date of allDates) {
    result[date] = {
      date,
      periods: avg(
        Object.keys(participants)
          .map((name) => participants[name].votes[date].periods))
    };
  }
  return result;
};

export default handleActions({
  [REG_QUESTION_LISTENER]: (state, {payload}) => {
    return {
      ...state,
      listeners: {
        ...state.listeners,
        [payload.name]: payload.ref,
      },
    };
  },

  [VOID_QUESTION_LISTENER]: (state, {payload}) => {
    return {
      ...state,
      listeners: {},
    };
  },

  [JOIN_REQUEST]: (state, { payload }) => {
    return {
      ...state,
      _join: {
        loading: true,
        name: payload,
      }
    };
  },

  [JOIN_SUCCESS]: (state, { payload }) => {
    const q = payload.questionData;
    return {
      ...state,
      _join: {
        loading: false,
      },
      questionData: payload.questionData,
      votes: payload.votes,
      score: calculateScore(q.structure, q.participants),
    };
  },

  [JOIN_ERROR]: (state, { payload }) => {
    return {
      ...state,
      loading: false,
      error: payload
    };
  },

  [QUESTION_UPDATE]: (state, { payload }) => {
    return {
      ...state,
      questionData: payload,
    };
  },

}, {
  // default state
  listeners: {},

  _join: {
    loading: false,
    error: null,
    name: null,
  },

  questionData: null,
  votes: null,
  score: null,
});
