import React, {Component} from 'react'
import {Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {respondFriendInvite} from '../../actions/invite'

class FriendInvite extends Component {
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
        return (
            <div>
                {this.props.inv.sender.first_name} ({this.props.inv.sender.email}) - 
                {!this.state.responded && this.props.inv.status === 1 && 
                    <span>
                        <Button onClick={() => this.handleClick(this.props.inv, 2)} size="small" variant="contained" color="primary">Confirm</Button>
                        <Button onClick={() => this.handleClick(this.props.inv, 3)} size="small" variant="contained" color="secondary">Delete</Button>
                    </span>
                }
                {this.state.responded && this.state.status === 2 && <span>Accepted Friend Request</span>}
                {this.state.responded && this.state.status === 3 && <span>Rejected Friend Request</span>}
            </div>
        )
    }
}

const mapDispatchToProps = {
    respondFriendInvite
}

export default connect(null, mapDispatchToProps)(FriendInvite)