import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Grid, Button } from "@material-ui/core";
import { compose } from "redux";
import { connect } from "react-redux";
import { renderTextField } from "../components";
import { axiosClient } from "../../accounts/axiosClient";
import { addGlobalMessage } from "../../actions";

class PasswordChange extends Component {
  constructor(props) {
    super(props);
  }

  handlePasswordChange = async (values) => {
    try {
      const response = await axiosClient.post(
        `/auth/users/set_password/`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      this.props.addGlobalMessage("success", "Successfully changed password.");
    } catch (e) {
      var message;

      if (e.response.data.new_password) {
        message = e.response.data.new_password[0];
      } else if (e.response.data.non_field_errors) {
        message = e.response.data.non_field_errors[0];
      } else {
        message = "Something went wrong.";
      }

      this.props.addGlobalMessage("error", message);
    }
  };

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(this.handlePasswordChange)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Field
              name="current_password"
              type="password"
              component={renderTextField}
              label="Current Password"
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="new_password"
              type="password"
              component={renderTextField}
              label="New Password"
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="re_new_password"
              type="password"
              component={renderTextField}
              label="Confirm Password"
            />
          </Grid>
          <Button color="primary" type="submit">
            Change
          </Button>
        </Grid>
      </form>
    );
  }
}

const mapDispatchToProps = {
  addGlobalMessage,
};

export default compose(
  connect(null, mapDispatchToProps),
  reduxForm({
    form: "passwordChange",
  })
)(PasswordChange);
