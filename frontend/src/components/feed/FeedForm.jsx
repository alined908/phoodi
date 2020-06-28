import React, {Component} from 'react'
import {Avatar, Card, Divider} from '@material-ui/core'
import {renderTextField} from '../components'
import { reduxForm, Field } from "redux-form";
import styles from '../../styles/feed.module.css'

class FeedForm extends Component {
    handleForm = (e ) => {
        e.stopPropagation();
        console.log("hello")
    }

    render () {
        const user = this.props.user
        return (
            <div className={styles.feedFormWrapper}>
                <Card className={styles.feedForm}>
                    <div className={styles.feedFormTop}>
                        <Avatar className={styles.userProfile} src={user.avatar} >
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                        </Avatar>
                        <div className={styles.feedFormInput} onClick={this.handleForm}>
                            <Field name="post" component={renderTextField} label="What's on your mind?" />
                        </div>
                    </div>
                </Card>
            </div>
        )
    }
}

export default reduxForm({form: 'feed'})(FeedForm)