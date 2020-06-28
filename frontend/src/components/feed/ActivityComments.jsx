import React, {Component} from 'react'
import {ActivityComment} from '../components'
import styles from '../../styles/feed.module.css'

class ActivityComments extends Component {
    render() {
        return (
            <div className={styles.comments}>
                {this.props.comments.map((comment) => (
                    <ActivityComment
                        form={`activity_comment-${comment.id}`}
                        key={comment.id}
                        comment={comment}
                    />
                ))}
            </div>
        )
    }
}

export default ActivityComments