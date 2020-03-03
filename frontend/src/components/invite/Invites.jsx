import React, {Component} from "react"
import {getUserMeetupInvites, respondMeetupInvite, getUserFriendInvites, respondFriendInvite} from "../../actions/invite"
import {inviteType, inviteStatus} from '../../constants/default-states'
import {connect} from 'react-redux'
import Invite from "./Invite"
import {Grid, Typography} from "@material-ui/core"

class Invites extends Component {

    componentDidMount(){
        this.props.getUserMeetupInvites();
        this.props.getUserFriendInvites();
    }
    
    render () {
        return (
            <div className="inner-wrap">
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        {!this.props.isMeetupInvitesInitialized ? 
                            <div>Initializing Meetup Invites..</div> : 
                            <>
                                <div className="inner-header">
                                    <Typography variant="h5">Meetup Invites</Typography>
                                </div>
                                <div className="invites">
                                    {this.props.meetupInvites.map((inv) => 
                                        <Invite inv={inv} type={inviteType.meetup}></Invite>
                                    )}
                                </div>
                            </>
                        }
                    </Grid>
                    <Grid item xs={6}>
                        {!this.props.isFriendInvitesInitialized ? 
                            <div>Initializing Friend Invites..</div> :
                            <>
                                <div className="inner-header">
                                    <Typography variant="h5">Friend Invites</Typography>
                                </div>
                                <div className="invites">
                                {this.props.friendInvites.map((inv) => 
                                    <Invite inv={inv} type={inviteType.friend}></Invite>
                                )}
                                </div>
                            </>
                        }
                    </Grid>
                </Grid>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        isFriendInvitesInitialized: state.user.isFriendInvitesInitialized,
        isMeetupInvitesInitialized: state.user.isMeetupInvitesInitialized,
        meetupInvites: state.user.invites.meetups,
        friendInvites: state.user.invites.friends
    }
}

const mapDispatchToProps = {
    respondFriendInvite,
    respondMeetupInvite,
    getUserMeetupInvites,
    getUserFriendInvites,
}

export default connect(mapStateToProps, mapDispatchToProps)(Invites)