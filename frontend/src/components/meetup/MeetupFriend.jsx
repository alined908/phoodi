import React from "react"
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {sendMeetupInvite} from '../../actions/invite'
import {connect} from 'react-redux'

const MeetupFriend = (props) => {
    const handleClick = () => {
        props.sendMeetupInvite(props.uri, props.friend.email)
    }

    return (
        <div>
            {props.friend.email}
            {props.isMember && <CheckCircleIcon></CheckCircleIcon>}
            {!props.isMember && <Button variant="contained" color="primary" size="small" onClick={handleClick}>Send Invite</Button>}
        </div>
    )
}

const mapDispatchToProps = {
    sendMeetupInvite
}

export default connect(null, mapDispatchToProps)(MeetupFriend)