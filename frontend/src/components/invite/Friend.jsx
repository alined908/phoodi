import React from "react"
import {Link} from "react-router-dom"
import {ListItem, ListItemAvatar, ListItemText, Typography, Avatar, Button} from '@material-ui/core'

const Friend = (props) => {
    return (
        <Link to={`/profile/${props.friend.user.id}`}>
            <div className="friend-chat elevate">
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={props.friend.user.avatar}>{props.friend.user.first_name.charAt(0)}{props.friend.user.last_name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={props.friend.user.first_name} secondary={<>
                        <Typography component="span" color="inherit" variant="body2"> 
                            {props.friend.user.email + " "}
                        </Typography>
                        </>
                    }>
                    </ListItemText>
                    {props.isUserFriend && <Link to={`/chat/${props.friend.chat_room}`}><Button variant="contained" color="primary">Chat</Button></Link>}
                </ListItem>
            </div>
        </Link>
    )
}

export default Friend