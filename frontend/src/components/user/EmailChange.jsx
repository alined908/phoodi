import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Grid, Button } from "@material-ui/core";
import { compose } from "redux";
import { connect } from "react-redux";
import { renderTextField } from "../components";
import { axiosClient } from "../../accounts/axiosClient";
import { addGlobalMessage } from "../../actions";

class EmailChange extends Component {
  constructor(props) {
    super(props);
  }

  handleEmailChange = async (values) => {
    try {
      const response = await axiosClient.post(
        `/auth/users/set_email/`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      this.props.addGlobalMessage("success", "Successfully changed email.");
    } catch (e) {
      console.log(e.response);
      var message;

      if (e.response.data.new_email) {
        message = e.response.data.new_email[0];
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
      <form onSubmit={handleSubmit(this.handleEmailChange)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Field
              name="new_email"
              type="email"
              component={renderTextField}
              label="New Email"
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="re_new_email"
              type="email"
              component={renderTextField}
              label="Confirm New Email"
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="current_password"
              type="password"
              component={renderTextField}
              label="Password"
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

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

const mapDispatchToProps = {
  addGlobalMessage,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: "EmailChange",
  })
)(EmailChange);
