import React, {Component} from 'react'
import {Avatar, Card} from '@material-ui/core'
import {renderTextField} from '../components'
import { reduxForm, Field } from "redux-form";
import styles from '../../styles/feed.module.css'
import FeedFormPopup from './FeedFormPopup'

class FeedForm extends Component {
    constructor(props){
        super(props)
        this.state = {
            open: false
        }
    }

    handleForm = (e) => {
        this.toggleForm()
        e.stopPropagation();
        console.log("hello")
    }

    toggleForm = () => {
        this.setState({open: !this.state.open})
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
                            <Field name="post" disabled={true} component={renderTextField} label="What's on your mind?" />
                        </div>
                    </div>
                </Card>
                <FeedFormPopup 
                    open={this.state.open} 
                    addActivity={this.props.addActivity}
                    handleClose={this.toggleForm}
                />
            </div>
        )
    }
}

export default reduxForm({form: 'feed'})(FeedForm)