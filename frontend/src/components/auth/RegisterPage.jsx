import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { compose } from "redux";
import { connect } from "react-redux";
import { signup, editUser, removeSuccessMessage, signinHelper} from "../../actions";
import {
  Paper,
  Grid,
  Fab,
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  CircularProgress
} from "@material-ui/core";
import { GoogleLogin } from 'react-google-login';
import {axiosClient} from '../../accounts/axiosClient'
import FacebookLogin from 'react-facebook-login';
import { renderTextField } from "../components";
import FacebookIcon from '@material-ui/icons/Facebook';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { userPropType } from "../../constants/prop-types";
import styles from "../../styles/form.module.css";
import { Helmet } from "react-helmet";

const validate = (values) => {
  const errors = {};
  if (!values.first_name) {
    errors.first_name = "First Name is required.";
  }

  if (!values.last_name) {
    errors.last_name = "Last Name is required.";
  }

  if (!values.email) {
    errors.email = "Email is required.";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Email Address is not valid.";
  }

  if (!values.password || values.password.length < 6) {
    errors.password = "Password must be more than 6 characters";
  }

  return errors;
};

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageURL: "",
      isSubmitting: false
    };
    this.handleImageChange = this.handleImageChange.bind(this);
  }

  onSubmit = async (formProps) => {
    this.setState({isSubmitting: true})
    let data = new FormData();
    for (var key in formProps) {
      data.append(key.toString(), formProps[key]);
    }
    if (this.state.image !== null) {
      data.append("avatar", this.state.image, this.state.image.name);
    }

    
    if (this.props.type === "create") {
      let redirect;
      if (this.props.location && this.props.location.state && this.props.location.state.from) {
        redirect = () => {
          this.props.history.push(this.props.location.state.from);
        };
      } else {
        redirect = () => {
          this.props.history.push("/meetups");
        };
      }
      await this.props.signup(data, redirect);
    }

    if (this.props.type === "edit") {
      await this.props.editUser(data, this.props.user.id, () =>
        this.props.handleClose()
      );
    }
    this.setState({isSubmitting: false})
  };

  componentWillUnmount() {
    this.props.removeSuccessMessage();
  }

  handleGoogleSocialAuth = async (res) => {
    if (res.error){
      return;
    }
    const response = await axiosClient.post(
      '/auth/google/', {tokenId: res.tokenId}
    )
    console.log(response.data)
    signinHelper(response.data, this.props.dispatch, () => this.props.history.push("/meetups"))
  }

  handleFacebookSocialAuth = async (res) => {
    if (res.error) {
      return;
    }
    console.log(res)
    const response = await axiosClient.post(
      '/auth/facebook/', {accessToken: res.accessToken, email: res.email, name: res.name}
    )
    console.log(response.data)
    signinHelper(response.data, this.props.dispatch, () => this.props.history.push("/meetups"))
  }

  handleImageChange = (e) => {
    var reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        image: file,
        imageURL: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;
    const create = this.props.type === "create";

    return (
      <>
        {create ? (
          <div className={styles.container}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Register</title>
            </Helmet>
            <div className={styles.formWrapper}>
              <div className={styles.formhead}>
                <span className={styles.header}>Register</span>
              </div>
              <form
                className={styles.form}
                onSubmit={handleSubmit(this.onSubmit)}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Field
                      name="first_name"
                      component={renderTextField}
                      label="First Name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      name="last_name"
                      component={renderTextField}
                      label="Last Name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      name="email"
                      component={renderTextField}
                      label="Email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      name="password"
                      type="password"
                      component={renderTextField}
                      label="Password"
                    />
                  </Grid>
                  {!this.props.successMessage && this.props.errorMessage && (
                    <Grid item xs={12}>
                      <div className={styles.error}>
                        {this.props.errorMessage}
                      </div>
                    </Grid>
                  )}
                  {this.props.successMessage && (
                    <Grid item xs={12}>
                      <div className={styles.success}>
                        {this.props.successMessage}
                      </div>
                    </Grid>
                  )}
                </Grid>
                <div className={`${styles.fab} ${styles.loading}`}>
                  <Fab
                    type="submit"
                    variant="extended"
                    color="primary"
                    aria-label="register"
                    className={this.state.isSubmitting && styles.fabSubmitting}
                    disabled={submitting || invalid || this.state.isSubmitting}
                  >
                    Register
                  </Fab>
                  {this.state.isSubmitting && (
                    <CircularProgress size={20} className={styles.progress} />
                  )}
                </div>
              </form>
              <div className={styles.bottom}>
                <div className={styles.socials}>
                  <GoogleLogin
                    clientId={process.env.REACT_APP_GOOGLE_OAUTH2_KEY}
                    buttonText="Continue with Google"
                    onSuccess={this.handleGoogleSocialAuth}
                    onFailure={this.handleGoogleSocialAuth}
                    cookiePolicy={'single_host_origin'}
                    className={`${styles.social} ${styles.google}`}
                  />
                  <FacebookLogin
                    autoLoad={false}
                    reauthenticate={true}
                    appId={process.env.REACT_APP_FACEBOOK_OAUTH2_KEY}
                    callback={this.handleFacebookSocialAuth}
                    fields="name,email,picture"
                    icon={<FacebookIcon/>}
                    textButton="Continue with Facebook"
                    cssClass={`${styles.social} ${styles.facebook}`}
                  />
                </div>
                <div className={styles.action}>
                  Already Have An Account?
                  <span className={styles.link}>
                    <Link to="/login">Login</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Dialog open={this.props.open} onClose={this.props.handleClose}>
            <DialogTitle>Edit Profile</DialogTitle>
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
              <DialogContent dividers>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} className={styles.indent}>
                    <Field
                      required
                      name="first_name"
                      component={renderTextField}
                      label="First Name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      required
                      name="last_name"
                      component={renderTextField}
                      label="Last Name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      required
                      name="email"
                      component={renderTextField}
                      label="Email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div className={styles.avatarlabel}>Avatar</div>
                    <div className={styles.avatar}>
                      <Avatar
                        className={styles.avatarBig}
                        src={this.props.user.avatar}
                      >
                        {this.props.user.first_name.charAt(0)}
                        {this.props.user.last_name.charAt(0)}
                      </Avatar>
                      <input
                        onChange={this.handleImageChange}
                        id="icon-button-file"
                        type="file"
                        className={styles.none}
                      />
                      <label htmlFor="icon-button-file">
                        <Button
                          aria-label="upload"
                          color="primary"
                          component="span"
                        >
                          Upload
                        </Button>
                      </label>
                      <span>
                        {this.state.image &&
                          `New Profile Picture --> ${this.state.image.name}`}
                      </span>
                      {this.state.image && (
                        <Avatar
                          className={styles.avatarBig}
                          src={this.state.imageURL}
                        ></Avatar>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.props.handleClose}
                  color="secondary"
                  disabled={submitting}
                >
                  Close
                </Button>
                <div className={styles.loading}>
                  <Button
                    type="submit"
                    color="primary"
                    aria-label="add"
                    disabled={invalid || submitting}
                  >
                    Edit Profile
                  </Button>
                  {this.state.isSubmitting && (
                    <CircularProgress size={20} className={styles.progress} />
                  )}
                </div>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </>
    );
  }
}

RegisterPage.propTypes = {
  errorMessage: PropTypes.string,
  signup: PropTypes.func.isRequired,
  editUser: PropTypes.func.isRequired,
  user: userPropType,
};

function mapStatetoProps(state, ownProps) {
  if (ownProps.type === "edit" && state.user.user !== null) {
    const user = state.user.user;
    return {
      initialValues: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      errorMessage: state.user.signupErrorMessage,
      user: user,
    };
  } else {
    return {
      errorMessage: state.user.signupErrorMessage,
      successMessage: state.user.signupSuccessMessage,
    };
  }
}

const mapDispatchToProps = {
  signup,
  editUser,
  removeSuccessMessage,
};

export default compose(
  connect(mapStatetoProps, mapDispatchToProps),
  reduxForm({ form: "signup", validate })
)(RegisterPage);
