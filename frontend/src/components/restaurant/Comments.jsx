import React, {Component} from 'react'
import {Comment} from "../components"

class Comments extends Component {
    render () {
        return (
            <div>
                {this.props.comments.map((comment) => 
                    <Comment review={this.props.review} restaurant={this.props.restaurant} key={comment.id} comment={comment}/>
                )}
            </div>
        )
    }
}

export default Comments