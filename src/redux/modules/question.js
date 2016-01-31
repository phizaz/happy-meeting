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

const QUESTION_REQUEST = 'QUESTION_REQUEST';
const QUESTION_SUCCESS = 'QUESTION_SUCCESS';
const QUESTION_ERROR = 'QUESTION_ERROR';

const VOTE_REQUEST = 'VOTE_REQUEST';
const PARTICIPANTS_UPDATE = 'PARTICIPANTS_UPDATE';

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
  createAction(JOIN_SUCCESS, (name) => name);
const joinError =
  createAction(JOIN_ERROR, (error) => error);

const questionRequest =
  createAction(QUESTION_REQUEST, (name) => name);
const questionSuccess =
  createAction(QUESTION_SUCCESS, (questionData) => questionData);
const questionError =
  createAction(QUESTION_ERROR, (error) => error);

const voteRequest =
  createAction(VOTE_REQUEST, (question, date, period) => ({question, date, period}));
const participantsUpdate =
  createAction(PARTICIPANTS_UPDATE, (participants, votes) => ({participants, votes}));

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
                date: x.date,
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
              dispatch(joinSuccess(name));
              resolve(name);
            });
        })
        .catch(() => {
          dispatch(joinError('question not found'));
          reject('question not found');
        });
    });
  };
};

const questionAsync = (name) => {
  return (dispatch, getState) => {
    dispatch(questionRequest(name));
    const ref = fireRef
      .child('questions')
      .child(name);

    function getQuestionData (name) {
      return new Promise((resolve, reject) => {
        ref.once('value', (snapshot) => {
          const questionData = snapshot.val();
          if (!questionData) {
            reject('question not found');
          } else {
            resolve(questionData);
          }
        });
      });
    }

    function getOwner (name) {
      return new Promise((resolve, reject) => {
        fireRef.child('users').child(name)
          .once('value', (snapshot) => {
            const owner = snapshot.val();
            if (!owner) {
              reject('owner not found');
            } else {
              resolve(owner);
            }
          });
      });
    }

    return new Promise((resolve, reject) => {
      getQuestionData(name)
        .then((questionData) =>
          Promise.all([questionData, getOwner(questionData.owner)]))
        .then((values) => {
          const [questionData, owner] = values;
          const result = {
            ...questionData,
            owner: owner
          };
          dispatch(questionSuccess(result));
          resolve(result);
        })
        .catch((error) => {
          dispatch(questionError(error));
          reject(error);
        });
    });
  };
};

const vote = (question, date, period) => {
  return (dispatch, getState) => {
    dispatch(voteRequest(question, date, period));
    const authData = getState().auth.authData;
    const currentVote = getState().question.votes[date].periods[period];
    const ref =
      fireRef
        .child('questions')
        .child(question)
        .child('participants')
        .child(authData.uid)
        .child('votes')
        .child(date)
        .child('periods')
        .child(period);
    ref.set((currentVote + 1) % 3);
  };
};

const participantsListener = (authData, question) => {
  return (dispatch, getState) => {
    const ref =
      fireRef
        .child('questions')
        .child(question)
        .child('participants');
    dispatch(regListener('question', ref));
    ref.on('value', (snapshot) => {
      const participants = snapshot.val();
      const votes = participants[authData.uid].votes;
      dispatch(participantsUpdate(participants, votes));
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
  questionAsync,
  vote,
};

export const listeners = {
  participantsListener,
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
        ...state._join,
        loading: true,
        name: payload,
      }
    };
  },

  [JOIN_SUCCESS]: (state, { payload }) => {
    return {
      ...state,
      _join: {
        ...state._join,
        loading: false,
      },
    };
  },

  [JOIN_ERROR]: (state, { payload }) => {
    return {
      ...state,
      _join: {
        ...state._join,
        loading: false,
        error: payload
      },
    };
  },

  [QUESTION_REQUEST]: (state, { payload }) => {
    return {
      ...state,
      _question: {
        ...state._question,
        loading: true,
        name: payload
      },
    };
  },

  [QUESTION_SUCCESS]: (state, { payload }) => {
    return {
      ...state,
      _question: {
        ...state._question,
        loading: false,
      },
      questionData: payload,
    };
  },

  [QUESTION_ERROR]: (state, { payload }) => {
    return {
      ...state,
      _question: {
        ...state._question,
        loading: false,
        error: payload,
      },
      questionData: null,
    };
  },

  [PARTICIPANTS_UPDATE]: (state, { payload }) => {
    const q = state.questionData;
    const p = payload.participants;
    const v = payload.votes;
    return {
      ...state,
      questionData: {
        ...state.questionData,
        participants: p
      },
      votes: v,
      score: calculateScore(q.structure, p),
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

  _question: {
    loading: false,
    error: null,
    name: null,
  },

  questionData: undefined,
  votes: null,
  score: null,
});
