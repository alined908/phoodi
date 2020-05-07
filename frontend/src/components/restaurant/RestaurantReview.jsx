import React, { Component } from "react";
import { CommentForm, Comments, Rating } from "../components";
import { Button, IconButton, Avatar } from "@material-ui/core";
import { axiosClient } from "../../accounts/axiosClient";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@material-ui/icons";
import styles from "../../styles/forum.module.css"
import moment from "moment"

class RestaurantReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentForm: false,
      score: props.review.vote_score,
      vote: props.review.vote,
      comments: props.review.children,
    };
  }

  openCommentForm = () => {
    this.setState({ commentForm: !this.state.commentForm });
  };

  displayOnSuccess = (comment) => {
    this.setState({ comments: [...this.state.comments, comment] });
  };

  voteComment = async (direction) => {
    let data = {
      direction,
      review: this.props.review.id,
    };

    try {
      const response = await axiosClient.post("/api/vote/", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      let newVote = response.data;
      let oldVote = this.state.vote;
      let newScore = this.state.score;
      newScore -= oldVote ? oldVote.vote : 0;
      newScore += newVote.vote;

      this.setState({
        vote: newVote,
        score: newScore,
      });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <div className={styles.commentWrapper}>
        <div className={styles.comment}>
          <div className={styles.commentTop}>
            <div className={styles.commentTopLeft}>
              <Rating rating={this.props.review.rating}/>
              <span className={styles.commentUser}>
                {/* <Avatar style={{width: 20, height: 20, fontSize: ".65rem"}} src={this.props.review.user.avatar}>
                  {this.props.review.user.first_name.charAt(0)} {this.props.review.user.last_name.charAt(0)}
                </Avatar> */}
                {this.props.review.user.first_name} {this.props.review.user.last_name}
              </span>
              <span className={styles.commentDate}>
                {moment(this.props.review.timestamp).fromNow()}
              </span>
            </div>
            <div className={styles.commentTopRight}>
              <Button color="primary" onClick={this.openCommentForm} size="small" variant="contained">
                Reply
              </Button>
            </div>
          </div>
          <div className={styles.commentMiddle}>
            <div className={styles.commentVote}>
              {this.state.vote && this.state.vote.vote === 1 ? (
                <IconButton size="small" onClick={() => this.voteComment(0)} color="primary">
                  <ThumbUpIcon />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => this.voteComment(1)}>
                  <ThumbUpOutlinedIcon />
                </IconButton>
              )}
              {this.state.score}
              {this.state.vote && this.state.vote.vote === -1 ? (
                <IconButton size="small" onClick={() => this.voteComment(0)} color="primary">
                  <ThumbDownIcon />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => this.voteComment(-1)}>
                  <ThumbDownOutlinedIcon />
                </IconButton>
              )}
            </div>
            <span className={styles.commentText}>{this.props.review.text}</span>
            
          </div>
        </div>
        <Comments
          review={this.props.review}
          restaurant={this.props.restaurant}
          comments={this.state.comments}
        />
        {this.state.commentForm && (
            <CommentForm
              parent={null}
              review={this.props.review}
              handleClose={this.openCommentForm}
              restaurant={this.props.restaurant}
              displayOnSuccess={this.displayOnSuccess}
            />
          )}
      </div>
    );
  }
}

export default RestaurantReview;
