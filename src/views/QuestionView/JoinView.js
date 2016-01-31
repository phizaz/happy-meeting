import React, { PropTypes } from 'react';
import { dispatch } from '../../store';
import { actions as questionActions } from '../../redux/modules/question';
import { actions as authActions } from '../../redux/modules/auth';

import classNames from 'classnames';

import classes from './QuestionView.scss';
import LoadingView from '../LoadingView/LoadingView';

const actions = {
  ...questionActions,
  ...authActions,
};

class JoinView extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
  };

  componentDidMount () {
    if (!this.props.question.questionData) {
      // fetch questionData
      dispatch(actions.questionAsync(this.props.routeParams.name));
    }
  }

  handleJoin () {
    const authData = this.props.auth.authData;
    const questionData = this.props.question.questionData;

    if (!authData) {
      dispatch(actions.loginAsync())
        .then((authData) => {
          if (!questionData.participants[authData.uid]) {
            // the user has joined already !
            return;
          }

          dispatch(actions.joinAsync(questionData.name));
        });
    } else {
      // the authentication is present, go ahead for joining process
      dispatch(actions.joinAsync(questionData.name));
    }
  }

  get isJoining () {
    return this.props.question._join.loading;
  }

  get isFetching () {
    return this.props.question.questionData;
  }

  render () {
    if (!this.isFetching) {
      return <LoadingView />;
    } else {
      const questionData = this.props.question.questionData;

      return (
        <div className={classNames(classes.main, 'container text-center')}>
          <div className="row">
            <div className="col-md-12">
              <h1>
                <small>Would you like to join ?</small> <br/>
                {questionData.title} <small>{questionData.name}</small> <br/>
              </h1>
              <h4 className={classes.subtitle}><small>Asked by {questionData.owner.name}</small></h4>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 text-center">
              <button className="btn btn-primary btn-lg" onClick={() => this.handleJoin()}>
                {this.isJoining ? 'Joining..' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default JoinView;
