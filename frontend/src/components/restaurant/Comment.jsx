import React, {Component} from 'react'
import {Comments, CommentForm} from '../components'
import {Button, IconButton} from '@material-ui/core'
import {ThumbUpOutlined as ThumbUpOutlinedIcon, ThumbDownOutlined as ThumbDownOutlinedIcon, 
    ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon} from '@material-ui/icons'
import {axiosClient} from '../../accounts/axiosClient'

class Comment extends Component {
    constructor(props){
        super(props)
        this.state = {
            commentForm: false,
            score: props.comment.vote_score,
            vote: props.comment.vote,
            comments: props.comment.children
        }
    }

    openCommentForm = () => {
        this.setState({commentForm: !this.state.commentForm})
    }

    displayOnSuccess = (comment) => {
        this.setState({comments: [...this.state.comments, comment]})
    }

    voteComment = async (direction) => {
        let data = {
            direction, 
            review: this.props.review.id
        }

        try {
            const response = await axiosClient.post("/api/vote/", 
                data,
                {headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }}
            )
            let newVote = response.data
            let oldVote = this.state.vote
            let newScore = this.state.score;
            newScore -= (oldVote ? oldVote.vote : 0)
            newScore += newVote.vote
  
            this.setState({
                vote: newVote,
                score: newScore
            })
            
        } catch(e){
            console.log(e)
        }
    }

    render () {
        return (
            <div>
                {this.props.comment.text}
                <div>
                    {(this.state.vote && this.state.vote.vote === 1) ? 
                        <IconButton onClick={() => this.voteComment(0)}>
                            <ThumbUpIcon/>
                        </IconButton>
                        :
                        <IconButton onClick={() => this.voteComment(1)}>
                            <ThumbUpOutlinedIcon/>
                        </IconButton>
                    }
                    {this.state.score}
                    {(this.state.vote && this.state.vote.vote === -1) ?
                        <IconButton onClick={() => this.voteComment(0)}>
                            <ThumbDownIcon/>
                        </IconButton>
                        :
                        <IconButton onClick={() => this.voteComment(-1)}>
                            <ThumbDownOutlinedIcon/>
                        </IconButton>
                    }
                </div>
                <Button color="primary" onClick={this.openCommentForm}>
                    Reply
                </Button>
                {this.state.commentForm && 
                    <CommentForm  
                        review={this.props.review}
                        handleClose={this.openCommentForm}
                        restaurant={this.props.restaurant}
                        parent={this.props.comment.id}
                        displayOnSuccess={this.displayOnSuccess}
                    />
                }
                <Comments comments={this.state.comments} review={this.props.review} restaurant={this.props.restaurant}/>
            </div>
        )
    }
}

export default Comment