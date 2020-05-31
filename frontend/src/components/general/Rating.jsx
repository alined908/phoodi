import React, { Component } from "react";
import {Rating as MaterialRating} from '@material-ui/lab';
import "react-circular-progressbar/dist/styles.css";
import { withStyles } from '@material-ui/core/styles';
import {Star as StarIcon} from '@material-ui/icons'

const getGreen = (value) => {
  return ((10 - value * 2) / 10) * 255;
};

const StyledRating = withStyles({
  iconFilled: {
    color: props => `rgba(255, ${getGreen(props.value)} , 0, 0.9)`,
  },
  iconHover: {
    color: props => `rgba(255, ${getGreen(props.value)} , 0, 0.9)`,
  },
})(MaterialRating);

class Rating extends Component {

  render() {
    return (
        <StyledRating 
          size="small"
          value={this.props.rating/2}
          precision={0.5}
          readOnly={this.props.readOnly}
          onChange={this.props.onChange}
          max={this.props.max}
          icon={<StarIcon fontSize="inherit"/>}
        />
    );
  }
}

export default Rating;
