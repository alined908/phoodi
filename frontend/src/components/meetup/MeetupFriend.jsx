import React from "react"
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {sendMeetupInvite} from '../../actions/invite'
import {connect} from 'react-redux'
import { Button, Typography, Avatar, ListItem, ListItemText,ListItemAvatar} from "@material-ui/core"
import {Link} from 'react-router-dom'


const MeetupFriend = (props) => {
    const handleClick = () => {
        props.sendMeetupInvite(props.uri, props.friend.email)
    }

    return (
        <Link to={`/profile/${props.friend.id}`}>
            <ListItem>
                <ListItemAvatar>
                    <Avatar src={props.friend.avatar}/>
                </ListItemAvatar>
                <ListItemText primary={props.friend.first_name} secondary={<>
                    <Typography component="span" color="inherit" variant="body2"> 
                        {props.friend.email + " "}
                    </Typography>
                    </>
                }>
                </ListItemText>
                {props.isMember && <CheckCircleIcon></CheckCircleIcon>}
                {!props.isMember && <Button variant="contained" color="primary" size="small" onClick={handleClick}>Send Invite</Button>}
            </ListItem>
        </Link>
    )
}

const mapDispatchToProps = {
    sendMeetupInvite
}

export default connect(null, mapDispatchToProps)(MeetupFriend)