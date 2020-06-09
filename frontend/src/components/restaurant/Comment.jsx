import React, { Component } from "react";
import { Comments, CommentForm } from "../components";
import { Button, IconButton, Avatar } from "@material-ui/core";
import {
  FavoriteBorderOutlined as LikeBorderIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  FavoriteOutlined as LikeIcon,
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
      showChildren: false
    };
  }

  showChildren = () => {
    this.setState({showChildren: !this.state.showChildren})
  }

  openCommentForm = () => {
    this.setState({ commentForm: !this.state.commentForm });
  };

  displayOnSuccess = (comment) => {
    this.setState({ comments: [...this.state.comments, comment] });
  };

  voteComment = (value) => {
    let data = {
      value,
      comment: this.props.comment.id,
    };
    
    let newScore = (value === this.state.vote ? this.state.score - 1: this.state.score + 1)
    let newValue = (value === this.state.vote ? 0 : 1)

    this.setState({
      vote: newValue,
      score: newScore
    })
    
    axiosClient.post("/api/vote/", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  };

  render() {
    return (
      <div className={styles.commentWrapper}>
        <div className={styles.comment}>
          <div className={styles.commentLeft}>
            <Avatar src={this.props.comment.user.avatar}>
              {this.props.comment.user.first_name.charAt(0)} {this.props.comment.user.last_name.charAt(0)}
            </Avatar>
          </div>
          <div className={styles.commentMiddle}>
            <span className={styles.commentUser}>
              <span className={styles.commentName}>
                {this.props.comment.user.first_name} {this.props.comment.user.last_name}
              </span>
            </span>
            <span className={styles.commentText}>
              {this.props.comment.text}
            </span>
            <div className={styles.commentActions}>
              <span className={styles.commentDate}>
                {moment(this.props.comment.timestamp).fromNow()}
              </span>
              <span className={styles.commentLikes}>
                {this.state.score} Likes
              </span>
              <Button className={styles.commentActionButton} color="primary" onClick={this.openCommentForm} size="small">
                Reply
              </Button>
              {this.props.comment.comment_count > 0 && !this.state.showChildren &&
                <Button className={styles.commentActionButton} onClick={this.showChildren}  size="small" color="primary">
                  View {this.props.comment.comment_count} replies
                </Button>
              }
              {this.state.showChildren && 
                <Button className={styles.commentActionButton} onClick={this.showChildren} size="small" color="primary">
                  Hide replies
                </Button>
              }
            </div>
          </div>
          <div className={styles.commentRight}>
              {this.state.vote && this.state.vote.vote === 1 ? (
                <IconButton size="small" onClick={() => this.voteComment(0)} color="secondary">
                  <LikeIcon />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => this.voteComment(1)} color="secondary">
                  <LikeBorderIcon />
                </IconButton>
              )}
              {/* {this.state.vote && this.state.vote.vote === -1 ? (
                <IconButton size="small" onClick={() => this.voteComment(0)} color="primary">
                  <ThumbDownIcon />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => this.voteComment(-1)}>
                  <ThumbDownOutlinedIcon />
                </IconButton>
              )} */}
            
            
          </div>
        </div>
        {this.state.showChildren &&
          <Comments
            comments={this.state.comments}
            review={this.props.review}
            restaurant={this.props.restaurant}
          />
        }
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
    );
  }
}

export default Comment;
