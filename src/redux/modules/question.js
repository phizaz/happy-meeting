import { createAction, handleActions } from 'redux-actions';
import {
  fireRef,
  fetch,
  fetchOrFail,
  fetchUser,
  doesExist } from '../utils/firebase';

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
const VOTES_UPDATE = 'VOTES_UPDATE';

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
  createAction(PARTICIPANTS_UPDATE, (participants) => participants);
const votesUpdate =
  createAction(VOTES_UPDATE, (votes, myVotes) => ({votes, myVotes}));

const joinAsync = (name) => {
  return (dispatch, getState) => {
    const authData = getState().auth.authData;
    const questionRef = fireRef.child('questions').child(name);

    return new Promise((resolve, reject) => {
      dispatch(joinRequest(name));

      doesExist(questionRef)
        .then((questionData) => {
          console.log('join a question', questionData);
          // join a new question, and assign the default vote and add himself as one of the participants
          // set participants
          const participantsRef = questionRef.child('participants').child(authData.uid);
          participantsRef.set(true);

          // set votes
          const votesRef = questionRef.child('votes').child(authData.uid);
          votesRef.set(questionData.structure.map(x => ({
            date: x.date,
            periods: x.periods
          })));

          dispatch(joinSuccess(name));
          resolve(name);
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
    const questionRef = fireRef
      .child('questions')
      .child(name);

    return new Promise((resolve, reject) => {
      // fetch question
      fetchOrFail(questionRef)
        .then((questionData) =>
          Promise.all([
            questionData,
            // fetch owner
            fetchUser(questionData.owner)
          ].concat(
            // fetch all participants
            Object.keys(questionData.participants)
              .map((uid) => fetchUser(uid))
          )))
        .then((values) => {
          const [questionData, owner, ...participants] = values;
          const qData = {
            ...questionData,
            owner: owner,
            participants: participants.reduce((acc, x) => {
              // turns array into object (with uid as its indices)
              acc[x.uid] = x;
              return acc;
            }, {})
          };
          dispatch(questionSuccess(qData));
          resolve(qData);
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
    const currentVote =
      getState().question.votes[date].periods[period];
    const ref =
      fireRef
        .child('questions')
        .child(question)
        .child('votes')
        .child(authData.uid)
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
    dispatch(regListener('participants', ref));
    ref.on('value', (snapshot) => {
      const participants = snapshot.val();
      Promise.all(participants.map(uid => fetchUser(uid)))
        .then((participants) => {
          dispatch(participantsUpdate(
            // turn an array to object with uid as its indices
            participants.reduce((acc, x) => {
              acc[x.uid] = x;
              return acc;
            }, {})
          ));
        });
    });
  };
};

const votesListener = (authData, question) => {
  return (dispatch, getState) => {
    const ref =
      fireRef
        .child('questions')
        .child(question)
        .child('votes');
    dispatch(regListener('question', ref));
    ref.on('value', (snapshot) => {
      const votes = snapshot.val();
      const myVotes = votes[authData.uid];
      dispatch(votesUpdate(votes, myVotes));
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
  votesListener,
  voidQuestionListener,
};

// ------------------------------------
// Reducer
// ------------------------------------
const calculateScore = (structure, votes) => {
  // [[0, 0, 0], [0, 1, 2]] => avg => [0, 0.5, 1]
  const avg = (arr) => {
    // const result = [];
    // for (let j = 0; j < arr[0].length; ++j) {
    //   let sum = 0;
    //   for (let i = 0; i < arr.length; ++i) {
    //     sum += arr[i][j];
    //   }
    //   result.push(sum / arr.length);
    // }
    // return result;

    const acc = [];
    for (let i = 0; i < arr[0].length; ++i) {
      acc.push(0);
    }

    const sum = arr.reduce(
      (acc, row) => acc.map(
        (acc, i) => acc + row[i])
      , acc
    );

    const avg = sum.map(x => x / arr.length);
    return avg;
  };
  const allDates = Object.keys(structure);
  const result = {};
  for (let date of allDates) {
    result[date] = {
      date,
      periods: avg(
        Object.keys(votes)
          .map((uid) => votes[uid][date].periods))
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
    return {
      ...state,
      questionData: {
        ...state.questionData,
        participants: payload
      },
    };
  },

  [VOTES_UPDATE]: (state, {payload}) => {
    const q = state.questionData;
    const {votes, myVotes} = payload;
    return {
      ...state,
      questionData: {
        ...state.questionData,
        votes: votes,
      },
      votes: myVotes,
      score: calculateScore(q.structure, votes),
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
