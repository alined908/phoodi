import React, {Component} from "react"
import {Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {respondFriendInvite, respondMeetupInvite} from '../../actions/invite'
import {inviteType, inviteStatus} from '../../constants/default-states'
import {removeNotifs} from "../../actions/notifications"
import {Paper} from '@material-ui/core'
import {Link} from 'react-router-dom'

class Invite extends Component {
    constructor(props){
        super(props)
        this.state = {
            responded: false,
            status: props.inv.status
        }
    }

    handleClick = (inv, newStatus, type) => {
        type === inviteType.meetup ? this.props.respondMeetupInvite(inv.meetup.uri, inv.uri, newStatus) : this.props.respondFriendInvite(inv.uri, newStatus)
        type === inviteType.meetup ? this.props.removeNotifs({type: "meetup_invite", id: inv.id}) :this.props.removeNotifs({type: "friend_invite", id: inv.id})
        this.setState({responded: true, status: newStatus})
    }
    
    render () {
        const inv = this.props.inv
        const invite = !this.state.responded ? (
            <Paper className="paper invite elevate" elevation={3} variant="outlined">
                <div>
                    <Link to={`/profile/${inv.sender.id}`}>{inv.sender.first_name}</Link> {this.props.type === inviteType.meetup ? "- " + inv.meetup.name : ""}
                </div>
                {!this.state.responded && inv.status === 1 && 
                    <div>
                        <Button className="button" onClick={() => this.handleClick(this.props.inv, 2, this.props.type)} size="small" variant="outlined" color="primary">Confirm</Button>
                        <Button className="button" onClick={() => this.handleClick(this.props.inv, 3, this.props.type)} size="small" variant="outlined" color="secondary">Delete</Button>
                    </div>
                }
                {inv.status !== 1 && <span>{inviteStatus[inv.status]}</span>}
                {(this.state.responded && this.props.type === inviteType.friend && this.state.status === 2) && <span>Accepted</span>}
                {(this.state.responded && this.props.type === inviteType.friend && this.state.status === 3) && <span>Rejected</span>}
                {(this.state.responded && this.props.type === inviteType.meetup && this.state.status === 2) && <span>
                    <Link to={`/meetups/${inv.meetup.uri}`}>
                        <Button color="primary" variant="contained">Meetup</Button>
                    </Link>
                </span>
                }
                {(this.state.responded && this.props.type === inviteType.meetup && this.state.status === 3) && <span>Rejected</span>}
            </Paper>
        ) : <div></div>

        return (
            <>
                {invite}
            </>
        )
    }
}

const mapDispatchToProps = {
    respondFriendInvite,
    respondMeetupInvite,
    removeNotifs
}


export default connect(null, mapDispatchToProps)(Invite)