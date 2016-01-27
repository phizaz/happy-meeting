import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import { Link } from 'react-router';
import { actions as authActions } from '../../redux/modules/auth';
import { actions as homeActions } from '../../redux/modules/home';

const actions = {
  ...authActions,
  ...homeActions
};

// import classes from './HomeView.scss';

// We define mapStateToProps where we'd normally use
// the @connect decorator so the data requirements are clear upfront, but then
// export the decorated component after the main class definition so
// the component can be tested w/ and w/o being connected.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
const mapStateToProps = (state) => state;

export class HomeView extends React.Component {
  static propTypes = {
    homeNameChange: PropTypes.func.isRequired,
    homeTitleChange: PropTypes.func.isRequired,
    loginAsync: PropTypes.func.isRequired,
    createAsync: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
  };

  render () {
    const auth = this.props.auth;
    const home = this.props.home;

    const handleNameChange = (event) => {
      this.props.homeNameChange(event.target.value);
    };

    const handleTitleChange = (event) => {
      this.props.homeTitleChange(event.target.value);
    };

    const handleClick = () => {
      this.props.loginAsync()
        .then(() => this.props.createAsync(home.name, home.title));
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
                  onClick={handleClick}>
                  {loginText}
                </button>
                <button className='btn btn-lg btn-primary'
                  disabled="disabled">
                  with <i className="fa fa-facebook-official"></i>
                </button>
              </div>

              <div className="btn-group">
                <button className='btn btn-lg btn-primary'
                  onClick={this.props.logout}>
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

export default connect(mapStateToProps, actions)(HomeView);
