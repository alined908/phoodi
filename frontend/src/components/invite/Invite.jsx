import React, {Component} from "react"
import {Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {respondFriendInvite} from '../../actions/invite'
import {inviteType, inviteStatus} from '../../constants/default-states'
import {Paper} from '@material-ui/core'

class Invite extends Component {
    constructor(props){
        super(props)
        this.state = {
            responded: false,
            status: props.inv.status
        }
    }

    handleClick = (inv, newStatus) => {
        console.log(inv)
        this.props.respondFriendInvite(inv.uri, newStatus)
        this.setState({responded: true, status: newStatus})
    }
    

    render () {
        const inv = this.props.inv
        
        return (
            <Paper className="paper invite" elevation={3} variant="outlined">
                <div>{inv.sender.first_name} {this.props.type === inviteType.meetup ? "- " + inv.meetup.name : ""}</div>
                {!this.state.responded && inv.status === 1 && 
                    <div>
                        <Button className="button" onClick={() => this.handleClick(this.props.inv, 2)} size="small" variant="outlined" color="primary">Confirm</Button>
                        <Button className="button" onClick={() => this.handleClick(this.props.inv, 3)} size="small" variant="outlined" color="secondary">Delete</Button>
                    </div>
                }
                {inv.status !== 1 && <span>{inviteStatus[inv.status]}</span>}
                {this.state.responded && this.state.status === 2 && <span>Accepted Friend Request</span>}
                {this.state.responded && this.state.status === 3 && <span>Rejected Friend Request</span>}
            </Paper>
        )
    }
}

const mapDispatchToProps = {
    respondFriendInvite
}


export default connect(null, mapDispatchToProps)(Invite)