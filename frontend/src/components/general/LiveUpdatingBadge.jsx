import React, {Component} from "react"
import {connect} from 'react-redux'
import {Badge} from '@material-ui/core'

class LiveUpdatingBadge extends Component {

    determineType = (type) => {
        if (type === 'chat'){
            return this.props.notifs.chat_message
        } else if (type === 'meetup'){
            return this.props.notifs.meetup
        } else if (type === 'friend') {
            return this.props.notifs.friend
        } else if (type === 'invite'){
            return this.props.notifs.friend_inv + this.props.notifs.meetup_inv
        }
    }

    render () {
        return (
            <Badge badgeContent={this.determineType(this.props.type)} color="secondary">
                  {this.props.icon}
            </Badge>
        )
    }
}

function mapStateToProps(state) {
    return {
        notifs: state.notifs
    }
}

export default connect(mapStateToProps)(LiveUpdatingBadge)