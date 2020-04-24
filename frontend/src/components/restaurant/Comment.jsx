import React, {Component} from 'react'
import {Comments, CommentForm} from '../components'
import {Button} from '@material-ui/core'

class Comment extends Component {
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
                {this.props.comment.text}
                <Button color="primary" onClick={this.openCommentForm}>
                    Reply
                </Button>
                {this.state.commentForm && 
                    <CommentForm  
                        review={this.props.review}
                        handleClose={this.openCommentForm}
                        restaurant={this.props.restaurant}
                        parent={this.props.comment.id}
                    />
                }
                <Comments comments={this.props.comment.children} review={this.props.review} restaurant={this.props.restaurant}/>
            </div>
        )
    }
}

export default Comment