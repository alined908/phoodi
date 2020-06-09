import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Grid, Button } from "@material-ui/core";
import { compose } from "redux";
import { connect } from "react-redux";
import { renderTextField } from "../components";
import { addGlobalMessage, handleEmailChange } from "../../actions";

class EmailChange extends Component {
  
  handleClick = values => {
    this.props.handleEmailChange(values)
  };

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(this.handleClick)}>
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
        </Grid>
        <div style={{display: "flex", justifyContent: "flex-end"}}>
          <Button color="primary" type="submit" variant="contained">
              Change
          </Button>
        </div>
        
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
  handleEmailChange
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: "EmailChange",
  })
)(EmailChange);
