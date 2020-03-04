import React from "react"
import {Link} from "react-router-dom"
import {Paper, ListItem, ListItemAvatar, ListItemText, Typography, Avatar, Button} from '@material-ui/core'

const Friend = (props) => {
    return (
        <Link to={`/profile/${props.friend.user.id}`}>
            <Paper elevation={3} variant="outlined">
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={props.friend.user.avatar}/>
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
            </Paper>
        </Link>
    )
}

export default Friend