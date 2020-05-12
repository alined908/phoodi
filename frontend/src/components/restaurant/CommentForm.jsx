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
import { renderTextField } from "../components";
import styles from "../../styles/meetup.module.css";

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

class CommentForm extends Component {
  onSubmit = async (formProps) => {
    let data = {
      ...formProps,
      review_id: this.props.review.id,
      parent: this.props.parent,
    };

    try {
      const response = await axiosClient.post(
        `/api/restaurants/${this.props.restaurant.url}/comments/`,
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

  render() {
    const { handleSubmit, submitting, invalid } = this.props;

    return (
      <Dialog open={true} onClose={this.props.handleClose} maxWidth="md" fullWidth={true}>
        <DialogTitle>Comment</DialogTitle>
        <form
          className={styles.reviewForm}
          onSubmit={handleSubmit(this.onSubmit.bind(this))}
        >
          <DialogContent dividers>
            <Grid container spacing={1}>
                <Field
                  required
                  name="text"
                  label="text"
                  component={renderTextField}
                  {...{
                    multiline: true,
                    rows: 20,
                    variant: "filled",
                    fullWidth: true,
                  }}
                />
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
              disabled={invalid || submitting}
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
    form: "comment",
    validate
  })
)(CommentForm);
