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

  if (!values.email) {
    errors.email = "Email is required.";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Email Address is not valid.";
  }

  return errors;
};

class PasswordResetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false,
      isSubmitting: false,
    };
  }

  onSubmit = async (formProps) => {
    this.setState({ isSubmitting: true });
    try {
      const response = await axiosClient.post(
        "/auth/users/reset_password/",
        formProps
      );
      this.props.addGlobalMessage(
        "success",
        "Sent password reset link to email."
      );
      console.log(response);
    } catch (e) {
      console.log(e);
    }
    this.setState({ sent: true, isSubmitting: false });
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;

    return (
      <Paper className={styles.container} elevation={8}>
        <div className={styles.right}>
          <div className={styles.formhead}>
            <span className={styles.header}>Password Reset</span>
          </div>
          <form className={styles.form} onSubmit={handleSubmit(this.onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field name="email" component={renderTextField} label="Email" />
              </Grid>
              {this.props.errorMessage && (
                <Grid item xs={12}>
                  <div className={styles.error}>{this.props.errorMessage}</div>
                </Grid>
              )}
            </Grid>
            <div className={`${styles.fab} ${styles.loading}`}>
              <Fab
                color="primary"
                type="submit"
                variant="extended"
                aria-label="password-reset"
                disabled={submitting || invalid}
              >
                Send Password Reset
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
    form: "passwordReset",
    validate,
  })
)(PasswordResetPage);
