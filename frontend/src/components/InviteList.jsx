import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserMeetupInvites, sendMeetupInvite, respondMeetupInvite} from "../actions/invite"

class InviteList extends Component {

    componentDidMount(){
        this.props.getUserMeetupInvites();
    }
    
    render() {
        return (
            <div>
                {!this.props.isMeetupInvitesInitialized && <div>Initializing Invites..</div>}
                {this.props.isMeetupInvitesInitialized && this.props.meetupInvites.map((inv) => <div>inv</div>) }
            </div>
        )
    }
}

const mapDispatchToProps = {
    getUserMeetupInvites,
    sendMeetupInvite,
    respondMeetupInvite
}

function mapStateToProps(state) {
    return {
        isMeetupInvitesInitialized: state.user.isMeetupInvitesInitialized,
        meetupInvites: state.user.invites.meetups
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteList)