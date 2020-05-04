import React, { Component } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const styles = {
  width: 40,
  height: "auto",
  boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  borderRadius: "50%",
};

class Rating extends Component {
  getGreen = () => {
    return ((10 - this.props.rating) / 10) * 255;
  };

  render() {
    return (
      <div style={{ ...styles }}>
        <CircularProgressbar
          value={this.props.rating * 10}
          text={this.props.rating}
          styles={buildStyles({
            textSize: "40px",
            pathColor: `rgba(255, ${this.getGreen()} , 0 , .7)`,
            trailColor: "#f9f9f9",
            textColor: `black`,
          })}
        />
      </div>
    );
  }
}

export default Rating;
