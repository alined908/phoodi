import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import {
  Button,
  Typography,
  Grid,
  ButtonGroup,
  Slider,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@material-ui/core";
import { compose } from "redux";
import { connect } from "react-redux";
import { Error as ErrorIcon } from "@material-ui/icons";
import {
  getMeetup,
  getMeetupEvents,
  newMeetupEvent,
  editMeetupEvent
} from "../../actions";
import {
  renderDatePicker,
  renderTextField,
  CategoryAutocomplete,
} from "../components";
import styles from "../../styles/form.module.css";
import moment from "moment";

const marks = [
  { value: 0.25 },
  { value: 0.5 },
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 5 },
  { value: 10 },
  { value: 25 },
];
const convert = {
  0.25: 400,
  0.5: 800,
  1: 1600,
  2: 3200,
  3: 4800,
  5: 8000,
  10: 16000,
  25: 40000,
};
const reconvert = {
  400: 0.25,
  800: 0.5,
  1600: 1,
  3200: 2,
  4800: 3,
  8000: 5,
  16000: 10,
  40000: 25,
};
const priceLabel = ["< $10", "$11 - $30", "$31 - $60", "> $60"];

const validate = (values) => {
  const errors = {};

  if (!values.title) {
    errors.title = "Event title is required.";
  }
  if (!values.start) {
    errors.start = "Start time is required.";
  } else if (isNaN(values.start.getTime())) {
    errors.start = "Start time is not valid.";
  } else if (values.start >= values.end) {
    errors.start = "Start time must be before end time ";
  }

  if (!values.end) {
    errors.end = "End time is required.";
  } else if (isNaN(values.end.getTime())) {
    errors.end = "End time is not valid";
  } else if (values.start >= values.end) {
    errors.end = "End time must be after start time.";
  }
  return errors;
};

const convertPricesToState = (prices) => {
  const nums = prices !== undefined ? prices.replace(/ /g, "").split(",") : "";
  var state = [false, false, false, false];
  for (var i = 0; i < nums.length; i++) {
    const entry = parseInt(nums[i]) - 1;
    state[entry] = true;
  }
  return state;
};

class MeetupEventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: props.entries ? props.entries : [],
      prices: props.prices
        ? convertPricesToState(props.prices)
        : [true, true, false, false],
      distance: props.distance ? reconvert[props.distance] : 10,
      random: props.random ? props.random : true,
      isSubmitting: false,
    };
    this.onTagsChange = this.onTagsChange.bind(this);
  }

  handleEntries = () => {
    const entries = {};
    for (var i = 0; i < this.state.entries.length; i++) {
      let entry = this.state.entries[i];
      entries[entry.api_label] = entry.id;
    }
    return entries;
  };

  onSubmit = async (formProps) => {
    this.setState({ isSubmitting: true });
    const indices = this.state.prices.reduce(
      (out, bool, index) => (bool ? out.concat(index + 1) : out),
      []
    );
    const prices = indices.join(", ");
    const meetup = this.props.meetup;

    if (this.props.type === "create") {
      const data = {
        entries: this.handleEntries(),
        distance: convert[this.state.distance],
        price: prices,
        random: this.state.random,
        ...formProps,
      };
      await this.props.newMeetupEvent(this.props.uri, data)
    }

    if (this.props.type === "edit") {
      const date = moment(meetup.date);
      const start = moment(formProps.start).set({
        date: date.date(),
        month: date.month(),
        year: date.year(),
      });
      const end = moment(formProps.end).set({
        date: date.date(),
        month: date.month(),
        year: date.year(),
      });
      const data = {
        entries: this.handleEntries(),
        distance: convert[this.state.distance],
        price: prices,
        random: this.state.random,
        start: start.toDate(),
        end: end.toDate(),
        title: formProps.title,
      };
      await this.props.editMeetupEvent(meetup.uri, this.props.event, data)
    }
    await this.props.handleClose();
    this.setState({ isSubmitting: false });
  };

  handlePrice = (price) => {
    const prices = [...this.state.prices];
    prices[price - 1] = !prices[price - 1];
    this.setState({ prices });
  };

  handleDistance = (e, val) => {
    this.setState({ distance: val });
  };

  handleRandomClick = (type) => {
    this.setState({ random: type });
  };

  onTagsChange = (event, values) => {
    this.setState({ entries: values });
  };

  generatePriceLabel = () => {
    var labels = [];
    var prices = this.state.prices;

    for (var i = 0; i < prices.length; i++) {
      if (prices[i]) {
        labels.push(priceLabel[i]);
      }
    }

    return labels.join("\xa0 , \xa0\xa0");
  };

  determineDisable = (submitting, invalid) => {
    var disable = false;

    // No prices selected
    if (!this.state.prices.includes(true)) {
      disable = true;
    }

    return disable || submitting || invalid;
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;
    const create = this.props.type === "create";

    return (
      <Dialog open={this.props.open} onClose={this.props.handleClose}>
        <DialogTitle>{create ? "Create New Event" : "Edit Event"}</DialogTitle>
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field
                  required
                  name="title"
                  component={renderTextField}
                  label="Event Name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  required
                  name="start"
                  component={renderDatePicker}
                  label="Start Time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  required
                  name="end"
                  component={renderDatePicker}
                  label="End Time"
                />
              </Grid>
              <Grid container item xs={12}>
                <div className={`${styles.catlabel} ${styles.warning}`}>
                  {this.state.entries.length === 0 && (
                    <>
                      <ErrorIcon style={{ color: "rgb(255, 212, 96)" }} />{" "}
                      &nbsp; No categories entered. All categories will be
                      considered.
                    </>
                  )}
                </div>
                <CategoryAutocomplete
                  form={true}
                  label="Search Categories..."
                  size="medium"
                  entries={this.state.entries}
                  handleClick={this.onTagsChange}
                />
              </Grid>
              <Grid item xs={12}>
                <div className="price">
                  <Typography variant="body1">Price</Typography>
                  <div className={styles.priceoptions}>
                    <ButtonGroup color="primary">
                      <Button
                        variant={
                          this.state.prices[0] ? "contained" : "outlined"
                        }
                        onClick={() => this.handlePrice(1)}
                      >
                        $
                      </Button>
                      <Button
                        variant={
                          this.state.prices[1] ? "contained" : "outlined"
                        }
                        onClick={() => this.handlePrice(2)}
                      >
                        $$
                      </Button>
                      <Button
                        variant={
                          this.state.prices[2] ? "contained" : "outlined"
                        }
                        onClick={() => this.handlePrice(3)}
                      >
                        $$$
                      </Button>
                      <Button
                        variant={
                          this.state.prices[3] ? "contained" : "outlined"
                        }
                        onClick={() => this.handlePrice(4)}
                      >
                        $$$$
                      </Button>
                    </ButtonGroup>
                    <div className={styles.indentlabel}>
                      {this.generatePriceLabel()}
                      {!this.state.prices.includes(true) && (
                        <span className={styles.error}>
                          Price filter is required.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="distance">
                  <Typography variant="body1">Distance (mi)</Typography>
                  <div className={styles.distanceoptions}>
                    <Slider
                      valueLabelDisplay="on"
                      step={null}
                      marks={marks}
                      value={this.state.distance}
                      min={0.25}
                      max={25}
                      onChange={(event, val) => this.handleDistance(event, val)}
                    />
                  </div>
                </div>
              </Grid>
              <Grid container item xs={12}>
                <FormControlLabel
                  label="Random"
                  control={
                    <Radio
                      color="primary"
                      checked={this.state.random}
                      onClick={() => this.handleRandomClick(true)}
                    />
                  }
                />
                <FormControlLabel
                  label="Custom"
                  control={
                    <Radio
                      color="primary"
                      checked={!this.state.random}
                      onClick={() => this.handleRandomClick(false)}
                    />
                  }
                />
                <div className={styles.label}>
                  {this.state.random
                    ? "Randomly generates options"
                    : "Members add options"}
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
                color="primary"
                type="submit"
                aria-label="add"
                disabled={this.determineDisable(submitting, invalid)}
              >
                {create ? "Add Event" : "Edit Event"}
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
  const meetup = state.meetup.meetups[ownProps.uri];

  if (ownProps.type === "edit") {
    const event = meetup.events[ownProps.event];
    const today = moment();
    const convertedStart = moment(event.start).set({
      date: today.date(),
      month: today.month(),
      year: today.year(),
    });
    const convertedEnd = moment(event.end).set({
      date: today.date(),
      month: today.month(),
      year: today.year(),
    });

    return {
      initialValues: {
        title: event.title,
        start: convertedStart.toDate(),
        end: convertedEnd.toDate(),
      },
      distance: event.distance,
      prices: event.price,
      entries: event.categories,
      random: event.random,
      meetup: meetup,
    };
  } else {
    const closest = new Date(Math.ceil(new Date().getTime() / 300000) * 300000);
    return {
      initialValues: {
        start: closest,
        end: new Date(closest.getTime() + 30 * 60000),
      },
      entries: [],
    };
  }
}

const mapDispatchToProps = {
  newMeetupEvent,
  getMeetup,
  getMeetupEvents,
  editMeetupEvent
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({ form: "event", validate })
)(MeetupEventForm);
