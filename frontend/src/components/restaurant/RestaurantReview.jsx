import React, { Component } from "react";
import { CommentForm, Comments, Rating} from "../components";
import { Button, IconButton, Avatar} from "@material-ui/core";
import { axiosClient } from "../../accounts/axiosClient";
import {
  FavoriteBorderOutlined as LikeBorderIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  FavoriteOutlined as LikeIcon,
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

  voteComment = async (value) => {
    let data = {
      value,
      review: this.props.review.id,
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
    });
  };

  render() {
    console.log(this.props.review)
    return (
      <div className={styles.reviewWrapper}>
        <div className={styles.review}>
          <div className={styles.commentLeft}>
            <Avatar src={this.props.review.user.avatar}>
              {this.props.review.user.first_name.charAt(0)} {this.props.review.user.last_name.charAt(0)}
            </Avatar>
          </div>
          <div className={styles.commentMiddle}>
            <span className={styles.commentUser}>
              <span className={styles.commentName}>
                {this.props.review.user.first_name} {this.props.review.user.last_name}
              </span>
              <Rating 
                rating={this.props.review.rating}
                readOnly={true}
              />
            </span>
            <span className={styles.commentText}>
              {this.props.review.text}
            </span>
            <div className={styles.commentActions}>
              <span className={styles.commentDate}>
                {moment(this.props.review.created_at).fromNow()}
              </span>
              <span className={styles.commentLikes}>
                {this.state.score} Likes
              </span>
              
              <Button className={styles.commentActionButton} color="primary" onClick={this.openCommentForm} size="small" >
                Reply
              </Button>
              {this.props.review.comment_count > 0 && !this.state.showChildren &&
                <Button className={styles.commentActionButton} onClick={this.showChildren}  size="small" color="primary">
                  View {this.props.review.comment_count} replies
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
            {this.state.vote === 1 ? (
                <IconButton size="small" onClick={() => this.voteComment(1)} color="secondary">
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
            review={this.props.review}
            restaurant={this.props.restaurant}
            comments={this.state.comments}
          />
        }
        
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
