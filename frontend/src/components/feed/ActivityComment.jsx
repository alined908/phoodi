import React, {Component} from 'react'
import styles from '../../styles/feed.module.css'
import {postActivityCommentLike} from '../../actions/feed'
import {Button, Avatar} from '@material-ui/core'
import { ActivityCommentForm, ActivityComments } from '../components';

class ActivityComment extends Component {

    constructor(props){
        super(props);
        this.state = {
            isLiked: props.comment.like,
            numLikes: props.comment.vote_score,
            comments: props.comment.children,
            showReplyForm: false
        }
    }

    handleLike = (newStatus) => {
        const likeChange = (newStatus === 1 ? 1 : -1)
        this.setState(
            {
                isLiked: !this.state.isLiked,
                numLikes: this.state.numLikes + likeChange
            }, 
            () => postActivityCommentLike(this.props.activity.id, newStatus, this.props.comment.id)
        )
    }

    handleNewComment = (comment) => {
        console.log(comment)
        this.setState({
            comments: [comment, ...this.state.comments],
            showReplyForm: false
        })
    } 

    handleReplyForm = () => {
        this.setState({showReplyForm: !this.state.showReplyForm})
    }

    render() {
        console.log(this.props.comment)
        const comment = this.props.comment
        const user = comment.user

        return (
            <div className={styles.comment}>
                <div className={styles.commentAvatar}>
                    <Avatar src={user.avatar} >
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                    </Avatar>
                </div>
                <div className={styles.commentContent}>
                    <div className={styles.commentInner}>
                        <div className={styles.commentUser}>
                            {user.first_name} {user.last_name}
                        </div>
                        <div className={styles.commentText}>
                            {comment.text}
                        </div>
                    </div>
                    {this.state.showReplyForm && 
                        <ActivityCommentForm 
                            form={this.props.form}
                            handleNewComment={this.handleNewComment}
                            user={this.props.user}
                            activity={this.props.activity}
                            parent={this.props.comment.id}
                        />
                    }
                    <div className={styles.commentActions}>
                        {this.state.isLiked ?
                            <Button onClick={() => this.handleLike(0)}>
                                Unlike
                            </Button>
                            :
                            <Button onClick={() => this.handleLike(1)}>
                                Like
                            </Button>
                        }
                        <span>
                            {this.state.numLikes} likes
                        </span>
                        <Button onClick={this.handleReplyForm}>
                            Reply
                        </Button>
                    </div>
                    <ActivityComments 
                        activity={this.props.activity}
                        user={this.props.user}
                        comments={this.state.comments}
                    />
                </div>
            </div>
        )
    }
}

export default ActivityComment