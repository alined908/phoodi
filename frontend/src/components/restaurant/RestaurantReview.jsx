import React, {Component} from 'react'
import {CommentForm, Comments} from "../components"
import {Button, IconButton} from '@material-ui/core'
import {axiosClient} from '../../accounts/axiosClient'
import {ThumbUpOutlined as ThumbUpOutlinedIcon, ThumbDownOutlined as ThumbDownOutlinedIcon, 
    ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon} from '@material-ui/icons'

class RestaurantReview extends Component {
    constructor(props){
        super(props)
        this.state = {
            commentForm: false,
            score: props.review.vote_score,
            vote: props.review.vote,
            comments: props.review.children
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
                {this.props.review.rating} - {this.props.review.text}
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
                    Comment
                </Button>
                <div>
                    <Comments review={this.props.review}  restaurant={this.props.restaurant} comments={this.state.comments}/>
                </div>
                {this.state.commentForm && 
                    <CommentForm  
                        parent={null}
                        review={this.props.review}
                        handleClose={this.openCommentForm}
                        restaurant={this.props.restaurant}
                        displayOnSuccess={this.displayOnSuccess}
                        />
                    }
            </div>
        )
    }
}

export default RestaurantReview