import React, {Component} from "react"
import {connect} from 'react-redux'
import {Badge} from '@material-ui/core'

class LiveUpdatingBadge extends Component {
    render () {
        return (
            <Badge badgeContent={this.props.notifs.chat ? this.props.notifs.chat : 0} showZero color="primary">
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