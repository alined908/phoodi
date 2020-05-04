import React, { Component } from "react";
import styles from "../../styles/form.module.css";
import { Paper, Grid, Fab, CircularProgress } from "@material-ui/core";
import { reduxForm, Field } from "redux-form";
import { renderTextField } from "../components";
import { axiosClient } from "../../accounts/axiosClient";
import { compose } from "redux";
import { connect } from "react-redux";
import { addGlobalMessage } from "../../actions/";

const validate = (values) => {
  const errors = {};

  return errors;
};

class PasswordResetConfirmPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      errorMessage: "",
    };
  }

  handleError = (error) => {
    const firstKey = Object.keys(error.response.data)[0];
    const errorMessage = error.response.data[firstKey][0];
    this.setState({ errorMessage });
  };

  onSubmit = async (formProps) => {
    this.setState({ isSubmitting: true });
    const data = {
      ...formProps,
      uid: this.props.match.params.uid,
      token: this.props.match.params.token,
    };
    try {
      await axiosClient.post("/auth/users/reset_password_confirm/", data);
      this.props.addGlobalMessage("success", "Password has been reset.");
      this.props.history.push("/login");
    } catch (e) {
      this.handleError(e);
    }
    this.setState({ sent: true, isSubmitting: false });
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;

    return (
      <Paper className={styles.container} elevation={8}>
        <div className={styles.right}>
          <div className={styles.formhead}>
            <span className={styles.header}>Password Reset Confirm</span>
          </div>
          <form className={styles.form} onSubmit={handleSubmit(this.onSubmit)}>
            <Grid container spacing={2}>
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
                  label="Confirm New Password"
                />
              </Grid>

              <Grid item xs={12}>
                <div className={styles.error}>{this.state.errorMessage}</div>
              </Grid>
            </Grid>
            <div className={`${styles.fab} ${styles.loading}`}>
              <Fab
                color="primary"
                type="submit"
                variant="extended"
                aria-label="password-reset"
                disabled={submitting || invalid}
              >
                Reset Password
              </Fab>
              {this.state.isSubmitting && (
                <CircularProgress size={20} className={styles.progress} />
              )}
            </div>
          </form>
        </div>
      </Paper>
    );
  }
}

const mapDispatchToProps = {
  addGlobalMessage,
};

export default compose(
  connect(null, mapDispatchToProps),
  reduxForm({
    form: "passwordResetConfirm",
    validate,
  })
)(PasswordResetConfirmPage);
