import React, { Component } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@material-ui/core";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { axiosClient } from "../../accounts/axiosClient";
import { renderTextField, Rating } from "../components";
import styles from "../../styles/meetup.module.css";

const ratings = {
  1: "The Health Hazard",
  2: "I wouldn't feed this to my dog",
  3: "Is this even food?",
  4: "Not worth to finish the meal",
  5: "Finished because I paid for it",
  6: "Once in a while",
  7: "The Solid Spot",
  8: "Worth a 30 min drive",
  9: "Flavor Explosion",
  10: "The Last Meal",
};

const validate = (values) => {
  const errors = {};

  if(!values.text){
      errors.text = "Text is required."
  }
  else if (values.text.length > 1000){
      errors.text =  "Max Character Limit is 1000. Be concise!"
  } else if (values.text.length < 50) {
      errors.text =  "Min Character Limit is 50. Type some more!"
  }

  return errors;
};

class RestaurantReviewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: null,
    };
  }

  onSubmit = async (formProps) => {
    let data = { ...formProps, rating: this.state.rating };
    console.log(data);
    try {
      const response = await axiosClient.post(
        `/api/restaurants/${this.props.restaurant.url}/reviews/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      this.props.displayOnSuccess(response.data);
    } catch (e) {
      console.log(e);
    }
    this.props.handleClose();
  };

  decideRating = (rating) => {
    this.setState({ rating });
  };

  render() {
    const { handleSubmit, submitting, invalid } = this.props;

    return (
      <Dialog open={true} onClose={this.props.handleClose} maxWidth="md">
        <DialogTitle>Review - {this.props.restaurant.name}</DialogTitle>
        <form
          className={styles.reviewForm}
          onSubmit={handleSubmit(this.onSubmit.bind(this))}
        >
          <DialogContent dividers>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Field
                  required
                  name="text"
                  label="Text"
                  component={renderTextField}
                  {...{
                    multiline: true,
                    rows: 20,
                    variant: "filled",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <div className={styles.ratings}>
                  {Object.keys(ratings).map((rating) => (
                    <div
                      className={`${styles.rating} ${this.state.rating === rating ? styles.ratingSelected : ""}`}
                      onClick={() => this.decideRating(rating)}
                    >
                      <span className={styles.ratingScore}>
                        <Rating rating={rating}/>
                      </span>
                      <span className={styles.ratingDescription}>
                        {ratings[rating]}
                      </span>
                    </div>
                  ))}
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
            <Button
              type="submit"
              color="primary"
              disabled={invalid || submitting || !this.state.rating}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: "review",
    validate
  })
)(RestaurantReviewForm);
