import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { dispatch } from 'redux/store';
// import { Link } from 'react-router';
import { actions as authActions } from '../../redux/modules/auth';
import { actions as homeActions } from '../../redux/modules/home';
import { routeActions } from 'redux-simple-router';

import {listeners} from 'redux/modules/question';

const actions = {
  ...authActions,
  ...homeActions,
  ...routeActions,
  ...listeners,
};

import classNames from 'classnames';
import classes from './QuestionView.scss';

// We define mapStateToProps where we'd normally use
// the @connect decorator so the data requirements are clear upfront, but then
// export the decorated component after the main class definition so
// the component can be tested w/ and w/o being connected.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
const mapStateToProps = (state) => state;

// wait for auth to confirm
class Loading extends React.Component {
  render () {
    const containerClass = classNames(classes.spinner, 'container', 'container-table');
    return (
      <div className={containerClass}>
        <div className={classNames(classes.vertical, 'row')}>
          <div className="text-center col-xs-4 col-xs-offset-4">
            <h1>
              <i className="fa fa-circle-o-notch fa-spin"></i> Please Wait...
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

class Question extends React.Component {
  static propTypes = {
    homeNameChange: PropTypes.func.isRequired,
    homeTitleChange: PropTypes.func.isRequired,
    loginAsync: PropTypes.func.isRequired,
    createAsync: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
  };

  componentDidMount () {
    const authData = this.props.auth.authData;
    const question = this.props.routeParams.name;
    // console.log('###question view mounted:', authData);
    dispatch(actions.questionListener(authData, question));
  }

  componentWillUnmount () {
    // console.log('###question view unmounted!');
    dispatch(actions.voidQuestionListener());
  }

  get ready () {
    return !!this.props.question.questionData;
  }

  render () {
    if (!this.ready) {
      return <Loading />;
    } else {
      const questionData = this.props.question.questionData;

      return (
        <div className='container text-center'>
          <div className="row">
            <div className="col-md-12">
              <h1>{questionData.title} <small>{questionData.name}</small></h1>
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
      return <Loading />;
    } else if (!this.isAuthorized) {
      dispatch(actions.push('/'));
      return false;
    } else {
      return <Question {...this.props} />;
    }
  }
}

export default connect(mapStateToProps, actions)(QuestionView);
