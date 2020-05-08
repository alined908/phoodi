import React, { Component } from "react";
import { connect } from "react-redux";
import { signout } from "../../actions";
import {CircularProgress} from '@material-ui/core'
import PropTypes from "prop-types";

class LogoutComponent extends Component {
  componentDidMount() {
    setTimeout(() => this.props.signout(() => {
      this.props.history.push("/login");
    }), 500);
  }

  render() {
    return (
        <div className="loading">
          <CircularProgress size={30}/>
        </div>
    );
  }
}

LogoutComponent.propTypes = {
  signout: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  signout,
};

export default connect(null, mapDispatchToProps)(LogoutComponent);
