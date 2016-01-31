import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { dispatch } from '../../store';
// import { Link } from 'react-router';
import { actions as authActions } from '../../redux/modules/auth';
import { actions as questionActions } from '../../redux/modules/question';
import { routeActions } from 'react-router-redux';

import {listeners} from 'redux/modules/question';

const actions = {
  ...authActions,
  ...questionActions,
  ...routeActions,
  ...listeners,
};

import classNames from 'classnames';
import classes from './QuestionView.scss';

import LoadingView from '../LoadingView/LoadingView';
import JoinView from './JoinView';

// We define mapStateToProps where we'd normally use
// the @connect decorator so the data requirements are clear upfront, but then
// export the decorated component after the main class definition so
// the component can be tested w/ and w/o being connected.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
const mapStateToProps = (state) => state;

function dateNumberToString (number) {
  const mapper = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday',
  };
  return mapper[number];
}

class Ranking extends React.Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
  };

  get ranking () {
    const score = this.props.question.score;

    function unfold (score) {
      const result = [];
      for (let date of Object.keys(score)) {
        const periods = score[date].periods;
        for (let i of Object.keys(periods)) {
          const avg = periods[i];
          result.push([avg, date, i]);
        }
      }
      return result;
    }

    return unfold(score).sort((a, b) => b[0] - a[0]);
  }

  render () {
    const questionData = this.props.question.questionData;
    const periodNames = questionData.labels;

    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Avg. score</th>
            <th>Date</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {
            this.ranking.slice(0, 5).map((x, idx) => (
              <tr>
                <td>{idx + 1}</td>
                <td>{x[0]}</td>
                <td>{dateNumberToString(x[1])}</td>
                <td>{periodNames[x[2]]}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}

class Question extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
  };

  get hasFetched () {
    return this.props.question.questionData;
  }

  get hasJoined () {
    const authData = this.props.auth.authData;
    const question = this.props.question;
    const questionData = question.questionData;
    return questionData.participants[authData.uid];
  }

  componentDidMount () {
    const authData = this.props.auth.authData;
    const question = this.props.routeParams.name;
    let promise = Promise.resolve(null);

    if (!this.hasFetched) {
      // this won't be required if the questionData has been fetched in joining process, but it's indeed required for cold start, directly access to this view
      // fetch the questionData
      promise = dispatch(actions.questionAsync(question));
    }
    // the listener should not perform unless the question is fetched !
    promise.then(
      () => dispatch(actions.participantsListener(authData, question)));
  }

  componentWillUnmount () {
    // console.log('###question view unmounted!');
    dispatch(actions.voidQuestionListener());
  }

  voteToString (number) {
    return `level-${number}`;
  }

  handleVote (date, period) {
    const questionData = this.props.question.questionData;
    dispatch(actions.vote(questionData.name, date, period));
  }

  render () {
    const question = this.props.question;
    const questionData = question.questionData;

    if (questionData === undefined) {
      // loading question data
      return <LoadingView />;
    } else if (questionData === null) {
      // question not found
      return (
        <div>
          <h1 className="text-center">Oops... the question not found</h1>
        </div>
      );
    } else if (!this.hasJoined) {
      // user not participated in this question, ask for joining
      return <JoinView {...this.props} />;
    } else {
      let tableBody;
      if (question.votes) {
        tableBody = Object.keys(question.votes).map(
          (date) => {
            const x = question.votes[date];
            return (
              <tr key={date}>
                <td>{dateNumberToString(date)}</td>
                {x.periods.map((y, idx) =>
                  <td className={classNames(classes[this.voteToString(y)], classes.level)} onClick={
                    () => this.handleVote(date, idx)
                  }></td>
                )}
              </tr>
            );
          });
      }

      return (
        <div className={classNames(classes.main, 'container')}>
          <div className="row">
            <div className="col-md-12">
              <h1>
                  {questionData.title} <small>{questionData.name}</small>
              </h1>
              <h4 className={classes.subtitle}><small>Asked by {questionData.owner.name}</small></h4>
            </div>

            <div className="col-md-12">
              <table className="table text-center">
                <thead>
                  <tr>
                    <th>Day</th>
                    {questionData.labels.map(
                      x => <th>{x}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableBody}
                </tbody>
              </table>
            </div>

            <div className="col-md-12">
              <Ranking {...this.props} />
            </div>
          </div>
        </div>
      );
    }
  }
}

export class QuestionView extends React.Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
  };

  get isAuthResolving () {
    return this.props.auth._login.loading;
  }

  get isAuthorized () {
    return !!this.props.auth.authData;
  }

  render () {
    if (this.isAuthResolving) {
      // waiting for auth resoliving
      return <LoadingView />;
    } else if (!this.isAuthorized) {
      // the user is not authorized
      return <JoinView {...this.props} />;
    } else {
      return <Question {...this.props} />;
    }
  }
}

export default connect(mapStateToProps, actions)(QuestionView);
