import React from "react"
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const MeetupFriend = ({friend, isMember}) => {
    return (
        <div>
            {friend.email}
            {isMember && <CheckCircleIcon></CheckCircleIcon>}
            {!isMember && <Button variant="contained" color="primary" size="small" onClick={() => console.log("onclick")}>Send Invite</Button>}
        </div>
    )
}

export default MeetupFriend