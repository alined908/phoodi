import React, { Component } from "react";
import { Comments, CommentForm } from "../components";
import { Button, IconButton, Avatar } from "@material-ui/core";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@material-ui/icons";
import { axiosClient } from "../../accounts/axiosClient";
import styles from "../../styles/forum.module.css"
import moment from "moment"

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentForm: false,
      score: props.comment.vote_score,
      vote: props.comment.vote,
      comments: props.comment.children,
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
              <span className={styles.commentUser} style={{marginLeft: 0}}>
                <Avatar  src={this.props.comment.user.avatar}>
                  {this.props.comment.user.first_name.charAt(0)} {this.props.comment.user.last_name.charAt(0)}
                </Avatar>
                {this.props.comment.user.first_name} {this.props.comment.user.last_name}
              </span>
              <span className={styles.commentDate}>
                {moment(this.props.comment.timestamp).fromNow()}
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
            <span className={styles.commentText}>{this.props.comment.text}</span>
            
          </div>
        </div>
        <Comments
          comments={this.state.comments}
          review={this.props.review}
          restaurant={this.props.restaurant}
        />
        {this.state.commentForm && (
          <CommentForm
            review={this.props.review}
            handleClose={this.openCommentForm}
            restaurant={this.props.restaurant}
            parent={this.props.comment.id}
            displayOnSuccess={this.displayOnSuccess}
          />
        )}
      </div>
      // <div>
      //   <div className={styles.comment}>
      //     {this.props.comment.text}
      //     <div>
      //       {this.state.vote && this.state.vote.vote === 1 ? (
      //         <IconButton onClick={() => this.voteComment(0)}>
      //           <ThumbUpIcon />
      //         </IconButton>
      //       ) : (
      //         <IconButton onClick={() => this.voteComment(1)}>
      //           <ThumbUpOutlinedIcon />
      //         </IconButton>
      //       )}
      //       {this.state.score}
      //       {this.state.vote && this.state.vote.vote === -1 ? (
      //         <IconButton onClick={() => this.voteComment(0)}>
      //           <ThumbDownIcon />
      //         </IconButton>
      //       ) : (
      //         <IconButton onClick={() => this.voteComment(-1)}>
      //           <ThumbDownOutlinedIcon />
      //         </IconButton>
      //       )}
      //     </div>
      //     <Button color="primary" onClick={this.openCommentForm}>
      //       Reply
      //     </Button>
      //   </div>
      // </div>
    );
  }
}

export default Comment;
