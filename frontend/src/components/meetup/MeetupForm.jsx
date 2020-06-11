import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { compose } from "redux";
import {
  Button,
  Grid,
  Radio,
  DialogContent,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogTitle,
  CircularProgress,
} from "@material-ui/core";
import { addMeetup, editMeetup, getMeetup } from "../../actions";
import {
  renderTextField,
  renderDateSimplePicker,
  Location,
} from "../components";
import styles from "../../styles/form.module.css";
import moment from "moment";
import Geocode from "react-geocode";
import { history } from "../MeetupApp";

const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = "Meetup name is required.";
  }
  if (!values.date) {
    errors.date = "Date is required.";
  } else if (isNaN(values.date.getTime())) {
    errors.date = "Date is not valid.";
  } else if (moment(values.date).add(1, "d").isBefore(moment().toDate())) {
    errors.date = "Date cannot be in the past";
  } else if (moment(values.date).isAfter(moment().add(1, "y"))) {
    errors.date = "Date is too far away";
  }

  return errors;
};

class MeetupForm extends Component {
  constructor(props) {
    super(props);
    const values = props.meetup
      ? {
          location: props.meetup.location,
          latitude: props.meetup.latitude,
          longitude: props.meetup.longitude,
          public: props.meetup.public,
        }
      : {
          location: "",
          latitude: null,
          longitude: null,
          public: false,
        };
    this.state = { ...values, isSubmitting: false };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
    if (this.props.type === "edit") {
      if (!this.props.isMeetupInitialized) {
        this.props.getMeetup(this.props.match.params.uri);
      }
    }
  }

  onSubmit = async (formProps) => {
    this.setState({ isSubmitting: true });
    let data = {
      ...formProps,
      location: this.state.location,
      public: this.state.public,
      longitude: this.state.longitude,
      latitude: this.state.latitude,
    };

    if (this.props.type === "create") {
      await this.props.addMeetup(data, (uri) => {
        history.push(`/meetups/${uri}`);
      });
    }

    if (this.props.type === "edit") {
      await this.props.editMeetup(data, this.props.meetup.uri);
    }
    await this.props.handleClose();
    this.setState({ isSubmitting: false });
  };

  handleClick = (e, value) => {
    console.log(value);
    if (value !== null) {
      Geocode.fromAddress(value.description).then((response) => {
          const geolocation = response.results[0].geometry.location;
          console.log(geolocation)
          this.setState({
            latitude: geolocation.lat, 
            longitude: geolocation.lng,
            location: value.description
          })
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  handleLocation = (e, value, reason) => {
    console.log(e, value, reason)
    this.setState({
      location: value
    })
  }

  handlePublicClick = (type) => {
    this.setState({ ...this.state, public: type });
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;
    const create = this.props.type === "create";

    return (
      <Dialog open={this.props.open} onClose={this.props.handleClose} scroll={"body"}>
        <DialogTitle>{create ? "Create Meetup" : "Edit Meetup"}</DialogTitle>
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <DialogContent dividers>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Field
                  required
                  name="name"
                  component={renderTextField}
                  label="Name"
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  required
                  name="date"
                  component={renderDateSimplePicker}
                  label="Date"
                  disabled={
                    this.props.isMeetupInitialized &&
                    moment(this.props.meetup.date)
                      .add(1, "d")
                      .isBefore(moment().toDate())
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Location
                  freeSolo={false}
                  required={true}
                  label="Location"
                  handleInputChange={this.handleLocation}
                  handleClick={this.handleClick}
                  textValue={this.state.location}
                />
              </Grid>
              <Grid container item xs={12} className={styles.control}>
                <FormControlLabel
                  label="Public"
                  control={
                    <Radio
                      size="small"
                      inputProps={{ ...styles.fonts }}
                      color="primary"
                      checked={this.state.public}
                      onClick={() => this.handlePublicClick(true)}
                    />
                  }
                />
                <FormControlLabel
                  label="Private"
                  control={
                    <Radio
                      size="small"
                      inputProps={{ ...styles.fonts }}
                      color="primary"
                      checked={!this.state.public}
                      onClick={() => this.handlePublicClick(false)}
                    />
                  }
                />
                
              </Grid>
              <Grid item xs={12}>
                <div className={styles.label}>
                  {this.state.public
                    ? "Public meetups are joinable by anyone"
                    : "Private meetups can be joined only by those you invite."}
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
                disabled={
                  invalid ||
                  submitting ||
                  this.state.location.length === 0 ||
                  !this.state.latitude
                }
              >
                {create ? "Add Meetup" : "Edit Meetup"}
              </Button>
              {this.state.isSubmitting && (
                <CircularProgress size={20} className={styles.progress} />
              )}
            </div>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

function mapStateToProps(state, ownProps) {
  if (ownProps.type === "edit" && ownProps.uri in state.meetup.meetups) {
    const meetup = state.meetup.meetups[ownProps.uri];
    return {
      initialValues: {
        name: meetup.name,
        date: moment(meetup.date).toDate(),
      },
      meetup: meetup,
      isMeetupInitialized: true,
    };
  } else {
    return {
      initialValues: { date: new Date() },
      isMeetupInitialized: false,
    };
  }
}

const mapDispatchToProps = {
  addMeetup,
  editMeetup,
  getMeetup,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({ form: "meetup", validate })
)(MeetupForm);
