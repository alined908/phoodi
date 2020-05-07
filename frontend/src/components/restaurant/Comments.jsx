import React, { Component } from "react";
import { Comment } from "../components";
import styles from "../../styles/forum.module.css"

class Comments extends Component {
  render() {
    return (
      <div className={styles.children}>
        {this.props.comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            review={this.props.review}
            restaurant={this.props.restaurant}
          />
        ))}
      </div>
    );
  }
}

export default Comments;
