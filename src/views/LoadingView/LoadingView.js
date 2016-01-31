import React from 'react';
import classNames from 'classnames';

import classes from './LoadingView.scss';

class LoadingView extends React.Component {
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

export default LoadingView;
