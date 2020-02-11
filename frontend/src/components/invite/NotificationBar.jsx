import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserMeetupInvites, sendMeetupInvite, respondMeetupInvite, getUserFriendInvites, sendFriendInvite, respondFriendInvite} from "../../actions/invite"
import InviteList from "./InviteList"
import {inviteType} from "../../constants/default-states"

class NotificationBar extends Component {
    componentDidMount(){
        this.props.getUserMeetupInvites();
        this.props.getUserFriendInvites();
    }

    render() {
        return (
            <div className="notif-bar">
                {!this.props.isMeetupInvitesInitialized && <div>Initializing Meetup Invites..</div>}
                {this.props.isMeetupInvitesInitialized && <InviteList invites={this.props.meetupInvites} type={inviteType.meetup}/>}
                {!this.props.isFriendInvitesInitialized && <div>Initializing Friend Invites..</div>}
                {this.props.isFriendInvitesInitialized && <InviteList invites={this.props.friendInvites} type={inviteType.friend}/>}
            </div>
        )
    }
}

const mapDispatchToProps = {
    getUserMeetupInvites,
    getUserFriendInvites,
}

function mapStateToProps(state) {
    return {
        isFriendInvitesInitialized: state.user.isFriendInvitesInitialized,
        isMeetupInvitesInitialized: state.user.isMeetupInvitesInitialized,
        meetupInvites: state.user.invites.meetups,
        friendInvites: state.user.invites.friends
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationBar)