import React, {Component} from 'react'
import styles from '../../styles/feed.module.css'
import {Button, Avatar} from '@material-ui/core'

class ActivityComment extends Component {
    render() {
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
                    <div className={styles.commentActions}>
                        <Button>
                            Like
                        </Button>
                        <Button>
                            Reply
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ActivityComment