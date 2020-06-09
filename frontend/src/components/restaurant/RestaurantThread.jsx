import React, { Component } from "react";
import { RestaurantReview } from "../components";
import styles from "../../styles/forum.module.css"

class RestaurantThread extends Component {
  render() {
    const reviews = this.props.reviews;

    return (
      <div className={styles.thread}>
        {reviews.map((review) => (
          <RestaurantReview
            authenticated={this.props.authenticated}
            key={review.id}
            review={review}
            restaurant={this.props.restaurant}
          />
        ))}
      </div>
    );
  }
}

RestaurantThread.propTypes = {

};

export default RestaurantThread;
