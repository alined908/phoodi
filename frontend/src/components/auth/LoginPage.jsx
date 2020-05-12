import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { compose } from "redux";
import { connect } from "react-redux";
import { signin } from "../../actions";
import { Paper, Grid, Fab } from "@material-ui/core";
import { Link } from "react-router-dom";
import { renderTextField } from "../components";
import { ReactComponent as Fan } from "../../assets/svgs/fans.svg";
import { ReactComponent as Google } from "../../assets/svgs/google.svg";
import { ReactComponent as Facebook } from "../../assets/svgs/facebook.svg";
import { ReactComponent as Twitter } from "../../assets/svgs/twitter.svg";
import styles from "../../styles/form.module.css";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const validate = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = "Email is required.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
};

class LoginPage extends Component {
  onSubmit = (formProps) => {
    let redirect;
    if (this.props.location.state && this.props.location.state.from) {
      redirect = () => {
        this.props.history.push(this.props.location.state.from);
      };
    } else {
      redirect = () => {
        this.props.history.push("/meetups");
      };
    }
    this.props.signin(formProps, redirect);
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;

    return (
      <Paper className={styles.container} elevation={8}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Login</title>
        </Helmet>
        <div className={styles.left}>
          <Fan height="70%" width="70%" />
        </div>
        <div className={styles.right}>
          <div className={styles.formhead}>
            <span className={styles.header}>Login</span>
          </div>
          <form className={styles.form} onSubmit={handleSubmit(this.onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field name="email" component={renderTextField} label="Email" />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="password"
                  type="password"
                  component={renderTextField}
                  label="Password"
                />
              </Grid>
              {this.props.errorMessage && (
                <Grid item xs={12}>
                  <div className={styles.error}>{this.props.errorMessage}</div>
                </Grid>
              )}
            </Grid>
            <div className={styles.fab}>
              <Fab
                color="primary"
                type="submit"
                variant="extended"
                aria-label="login"
                disabled={submitting || invalid}
              >
                Login
              </Fab>
            </div>
          </form>
          <div className={styles.bottom}>
            <div className={styles.socials}>
              <div className={styles.social}>
                <Google width={40} height={40} />
              </div>
              <div className={styles.social}>
                <Facebook width={40} height={40} />
              </div>
              <div className={styles.social}>
                <Twitter width={40} height={40} />
              </div>
            </div>
            <div className={styles.action}>
              Don't Have An Account?
              <span className={styles.link}>
                <Link to="/register">Sign Up</Link>
              </span>
            </div>
            <div className={styles.action}>
              Forgot Password?
              <span className={styles.link}>
                <Link to="/password/reset">Reset</Link>
              </span>
            </div>
          </div>
        </div>
      </Paper>
    );
  }
}

LoginPage.propTypes = {
  errorMessage: PropTypes.string,
  signin: PropTypes.func.isRequired,
};

function mapStatetoProps(state) {
  return {
    errorMessage: state.user.loginErrorMessage,
  };
}

const mapDispatchToProps = {
  signin,
};

export default compose(
  connect(mapStatetoProps, mapDispatchToProps),
  reduxForm({
    form: "signin",
    validate
  })
)(LoginPage);

export { LoginPage as UnderlyingLoginPage };
