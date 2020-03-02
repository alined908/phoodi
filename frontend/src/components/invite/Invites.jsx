import React, {Component} from "react"
import {getUserMeetupInvites, sendMeetupInvite, respondMeetupInvite, getUserFriendInvites, sendFriendInvite, respondFriendInvite} from "../../actions/invite"
import {inviteType, inviteStatus} from '../../constants/default-states'
import {connect} from 'react-redux'
import Invite from "./Invite"
import {Button, Grid, Typography} from "@material-ui/core"
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux'

class Invites extends Component {

    componentDidMount(){
        this.props.getUserMeetupInvites();
        this.props.getUserFriendInvites();
    }

    onSubmit = (formProps) => {
        this.props.sendFriendInvite(formProps)
    }
    
    render () {
        const sendFriendRequestForm = () => {
            return (<form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <div>{this.props.errorMessage}</div>
                <Field name="email" component="input" label="email"/>
                <Button size="small" type="submit" variant="contained" color="primary">Send</Button>
            </form>)
        }

        const {handleSubmit} = this.props;

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
                                {sendFriendRequestForm()}
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
    sendFriendInvite,
}

export default compose(connect(mapStateToProps, mapDispatchToProps), reduxForm({form: 'friend'}))(Invites)