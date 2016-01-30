import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { dispatch } from 'redux/store';
// import { Link } from 'react-router';
import { actions as authActions } from '../../redux/modules/auth';
import { actions as homeActions } from '../../redux/modules/home';
import { actions as questionActions } from '../../redux/modules/question';
import { routeActions } from 'redux-simple-router';

const actions = {
  ...authActions,
  ...homeActions,
  ...questionActions,
  ...routeActions,
};
// import classes from './HomeView.scss';

const mapStateToProps = (state) => state;

export class HomeView extends React.Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
  };

  render () {
    const auth = this.props.auth;
    const home = this.props.home;

    const handleNameChange = (event) => {
      dispatch(actions.homeNameChange(event.target.value));
    };

    const handleTitleChange = (event) => {
      dispatch(actions.homeTitleChange(event.target.value));
    };

    const handleCreate = () => {
      dispatch(actions.loginAsync())
        .then(() =>
          dispatch(actions.createAsync(home.name, home.title)))
        .then(() =>
          dispatch(actions.joinAsync(home.name)))
        .then(() =>
          dispatch(actions.push(`/question/${home.name}`)))
        .catch((err) => {
          console.log('error:', err);
        });
    };

    const loginText = auth._login.loading
      ? <span>Logging in..</span>
      : auth.authData
        ? <span>You're logged in</span>
        : <span>Discover the meeting time</span>;

    return (
      <div className='container text-center'>

        <div className='row'>
          <div className='col-xs-12'>
            <h1>
              Happy Meeting
            </h1>
            <h3>
              A time when people are happy to meet.
            </h3>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12'>
            <div className="form-group">
              <input type="text"
                value={home.name}
                onChange={handleNameChange}
                className="form-control input-md"
                placeholder="ใส่ชื่อเรียกสั้น ๆ"/>
            </div>
            <div className="form-group">
              <input type="text"
                value={home.title}
                onChange={handleTitleChange}
                className="form-control input-lg"
                placeholder="ใส่หัวข้อของคำถาม"/>
            </div>
            <div className="form-group">
              <div className="btn-group">
                <button className='btn btn-lg btn-primary'
                  disabled={!home.name || !home.title}
                  onClick={handleCreate}>
                  {loginText}
                </button>
                <button className='btn btn-lg btn-primary'
                  disabled="disabled">
                  with <i className="fa fa-facebook-official"></i>
                </button>
              </div>

              <div className="btn-group">
                <button className='btn btn-lg btn-primary'
                  onClick={() => dispatch(actions.logout())}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps)(HomeView);
