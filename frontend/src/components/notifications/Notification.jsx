import React, {Component} from 'react'
import {Avatar, IconButton, Tooltip} from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check';
import GroupIcon from '@material-ui/icons/Group';
import RateReviewIcon from '@material-ui/icons/RateReview';
import MailIcon from '@material-ui/icons/Mail';
import ChatIcon from '@material-ui/icons/Chat';
import EventIcon from '@material-ui/icons/Event';
import {Link} from 'react-router-dom'
import styles from '../../styles/notifications.module.css'
import moment from 'moment'

class FriendInviteNotification extends Component {
    render() {
        const notification = this.props.notification
        return (
            <Link onClick={this.props.onClose} to="/invites"> 
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color: 'blue'}}>
                        <MailIcon color="inherit"/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.first_name} {notification.actor.last_name} sent you a friend invite
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                    
                </div>  
            </Link>
        )
    }
}

class MeetupInviteNotification extends Component {
    render() {
        const notification = this.props.notification

        return (
            <Link onClick={this.props.onClose} to="/invites"> 
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color: 'blue'}}>
                        <MailIcon color="inherit"/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.first_name} {notification.actor.last_name} sent you a meetup invite
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                    
                </div>  
            </Link>
        )
    }
}

class FriendshipNotification extends Component {
    render() {
        const notification = this.props.notification

        return (
            <div className={styles.notification}>
                <div className={styles.notifType} style={{color:"green"}}>
                    <GroupIcon color='inherit'/>
                </div>
                <div>
                    <div className={styles.notifContent}>
                        You are now friends with {notification.actor.first_name} {notification.actor.last_name}
                    </div>
                    <div className={styles.notifDate}>
                        {moment(notification.created_at).format('MMMM Do h:mm a')}
                    </div>
                </div>
            </div> 
        )
    }
}

class FollowNotification extends Component {
    render() {
        return (
            <Link onClick={this.props.onClose} >
                <div className={styles.notification}>

                </div> 
            </Link>
        )
    }
}


class MeetupNotification extends Component {

    render() {
        const notification = this.props.notification
        return (
            <Link onClick={this.props.onClose} to={`/meetups/${notification.target.uri}`}>
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color:"purple"}}>
                        <EventIcon color='inherit'/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.user.first_name} {notification.actor.user.last_name} {notification.verb}
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                </div> 
            </Link>
        )
    }
}

class CommentNotification extends Component {
    render() {
        const notification = this.props.notification
        return (
            <Link onClick={this.props.onClose} to={`/restaurants/${notification.target.url}`}>
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color:"orange"}}>
                        <RateReviewIcon color='inherit'/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.first_name} {notification.actor.last_name} commented on your review of {notification.target.name}
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                    
                </div>
            </Link>
        )
    }
}

class ActivityNotification extends Component {
    render() {
        const notification = this.props.notification
        return (
            <Link onClick={this.props.onClose}>
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color:"black"}}>
                        <RateReviewIcon color='inherit'/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.first_name} {notification.actor.last_name} commented on your activity
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                    
                </div>
            </Link>
        )
    }
}

class ChatNotification extends Component {
    render() {
        const notification = this.props.notification
        return (
            <Link onClick={this.props.onClose} to={`/chat/${notification.action_object.uri}`}>
                <div className={styles.notification}>
                    <div className={styles.notifType} style={{color:"red"}}>
                        <ChatIcon color='inherit'/>
                    </div>
                    <div>
                        <div className={styles.notifContent}>
                            {notification.actor.first_name} {notification.actor.last_name}
                            &nbsp;
                            {notification.action_object.friendship ?
                                "sent a message to you."
                                :
                                `sent a message to ${notification.action_object.name}`
                            }
                        </div>
                        <div className={styles.notifDate}>
                            {moment(notification.created_at).format('MMMM Do h:mm a')}
                        </div>
                    </div>
                </div>
            </Link>
        )
    }
}

class Notification extends Component {

    render () {
        console.log(this.props.notification)
        const notification = this.props.notification
        const description = notification.description;
        let type;
        
        if (description === "activity"){
            type = <ActivityNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === "friend_invite"){
            type = <FriendInviteNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === 'meetup_invite'){
            type = <MeetupInviteNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === "meetup"){
            type = <MeetupNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === 'chat_message'){
            type = <ChatNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === "review") {
            type = <CommentNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === "follow"){
            type = <FollowNotification notification={notification} onClose={this.props.onClose}/>
        } else if (description === "friendship") {
            type = <FriendshipNotification notification={notification} onClose={this.props.onClose}/>
        } else {
            type = "No type"
        }

        return (
            <div className={styles.notifWrapper}>
                {type}
                <div className={styles.read}>
                    <Tooltip title="Mark as read">
                        <IconButton onClick={() => this.props.readNotif(notification.id)} color='inherit' size="small">
                            <CheckIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        )
    }
}

export default Notification