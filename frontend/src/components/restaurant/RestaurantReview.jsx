import React, {Component} from 'react'
import {CommentForm, Comments} from "../components"
import {Button} from '@material-ui/core'

class RestaurantReview extends Component {
    constructor(props){
        super(props)
        this.state = {
            commentForm: false
        }
    }
    
    openCommentForm = () => {
        this.setState({commentForm: !this.state.commentForm})
    }

    render () {
        return (
            <div>
                {this.props.review.rating} - {this.props.review.text}
                <Button color="primary" onClick={this.openCommentForm}>
                    Comment
                </Button>
                <div>
                    <Comments review={this.props.review}  restaurant={this.props.restaurant} comments={this.props.review.children}/>
                </div>
                {this.state.commentForm && 
                    <CommentForm  
                        parent={null}
                        review={this.props.review}
                        handleClose={this.openCommentForm}
                        restaurant={this.props.restaurant}
                        />
                    }
            </div>
        )
    }
}

export default RestaurantReview