import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { connect } from "react-redux";
import { addGlobalMessage } from "../../actions/";
import { CircularProgress } from "@material-ui/core";

class EmailActivationPage extends Component {
  async componentDidMount() {
    try {
      const data = {
        uid: this.props.match.params.uid,
        token: this.props.match.params.token,
      };
      const response = await axiosClient.post("/auth/users/activation/", data);
      this.props.addGlobalMessage("success", "Email has been confirmed.");
      console.log(response.data);
    } catch (e) {
      this.props.addGlobalMessage("error", "Error in confirmation.");
      console.log(e.response);
    }
    this.props.history.push("/login");
  }

  render() {
    return (
      <div class="loading">
        <CircularProgress size={50} />
      </div>
    );
  }
}

const mapDispatchToProps = {
  addGlobalMessage,
};

export default connect(null, mapDispatchToProps)(EmailActivationPage);
