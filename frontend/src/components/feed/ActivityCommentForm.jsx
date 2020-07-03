import React, {Component} from 'react'
import {renderTextField} from '../components'
import {Avatar, Button, IconButton} from '@material-ui/core'
import {postActivityComment} from '../../actions/feed'
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import { reduxForm, Field } from "redux-form";
import styles from '../../styles/feed.module.css'

class ActivityCommentForm extends Component {
    onSubmit = (formProps) => {
       postActivityComment(this.props.activity.id, this.props.parent, formProps.text, (comment) => this.props.handleNewComment(comment))
       this.props.reset()
    };

    render() {
        const { handleSubmit, submitting, invalid } = this.props;
        const user = this.props.user

        return (
            <form onSubmit={handleSubmit(this.onSubmit)} className={styles.commentForm}>
                <Avatar src={user.avatar} >
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                </Avatar>
                <Field name="text" component={renderTextField} label="Reply with something..." />
                <IconButton onClick={handleSubmit(this.onSubmit)} color="inherit">
                    <ArrowForwardIosOutlinedIcon/>
                </IconButton>
            </form>
        )
    }
}

export default reduxForm()(ActivityCommentForm)