import React, {Component} from "react"
import {Button, Avatar} from "@material-ui/core"
import {connect} from 'react-redux'
import {respondFriendInvite, respondMeetupInvite} from '../../actions/invite'
import {inviteType, inviteStatus} from '../../constants/default-states'
import {removeNotifs} from "../../actions/notifications"
import {Paper} from '@material-ui/core'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import {invitePropType} from '../../constants/prop-types'

class Invite extends Component {
    constructor(props){
        super(props)
        this.state = {
            responded: false,
            status: props.inv.status
        }
    }

    handleClick = async (inv, newStatus, type) => {
        (type === inviteType.meetup) ? 
            this.props.respondMeetupInvite(inv.meetup.uri, inv.uri, newStatus, this.props.pos): 
            this.props.respondFriendInvite(inv.uri, newStatus, this.props.pos)
        this.setState({responded: true, status: newStatus})
    }
    
    render () {
        const inv = this.props.inv

        return (
            <Paper className="paper invite elevate" variant="outlined">
                <div style={{display: "flex", alignItems: "center"}}>
                    <Avatar src={inv.sender.avatar}>
                        {inv.sender.first_name.charAt(0)} {inv.sender.last_name.charAt(0)}
                    </Avatar>
                    <Link to={`/profile/${inv.sender.id}`}>
                        {inv.sender.first_name} {inv.sender.last_name}
                    </Link> 
                    {this.props.type === inviteType.meetup ? "- " + inv.meetup.name : ""}
                </div>
                {!this.state.responded && inv.status === 1 && 
                    <div>
                        <Button 
                            className="button" size="small" 
                            variant="outlined"  color="primary"
                            onClick={() => this.handleClick(this.props.inv, 2, this.props.type)}
                        >
                            Confirm
                        </Button>
                        <Button 
                            className="button" size="small"
                            variant="outlined" color="secondary"
                            onClick={() => this.handleClick(this.props.inv, 3, this.props.type)} 
                        >
                            Delete
                        </Button>
                    </div>
                }
                {inv.status !== 1 && 
                    <span>
                        {inviteStatus[inv.status]}
                    </span>
                }
                {(this.state.responded && this.state.status === 2 && this.props.type === inviteType.friend) && 
                    <span>
                        <Link to={`/profile/${inv.sender.id}`}>
                            <Button color="primary" variant="contained">Profile</Button>
                        </Link>
                    </span> 
                }  
                {(this.state.responded && this.state.status === 2 && this.props.type === inviteType.meetup) && 
                    <span>
                        <Link to={`/meetups/${inv.meetup.uri}`}>
                            <Button color="primary" variant="contained">Meetup</Button>
                        </Link>
                    </span>
                }  
                {(this.state.responded && this.state.status === 3) && 
                    <span>
                        Rejected
                    </span>
                }
            </Paper>
        )
    }
}

Invite.propTypes = {
    inv: invitePropType,
    type: PropTypes.number.isRequired,
    respondFriendInvite: PropTypes.func.isRequired,
    respondMeetupInvite: PropTypes.func.isRequired,
    removeNotifs: PropTypes.func.isRequired
}

const mapDispatchToProps = {
    respondFriendInvite,
    respondMeetupInvite,
    removeNotifs
}


export default connect(null, mapDispatchToProps)(Invite)