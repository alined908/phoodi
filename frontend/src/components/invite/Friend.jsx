import React from "react"
import {Link} from "react-router-dom"
import {ListItem, ListItemAvatar, ListItemText, Tooltip, Typography, Avatar, makeStyles, IconButton} from '@material-ui/core'
import ChatIcon from '@material-ui/icons/Chat';

const useStyles = makeStyles({
    primary: {
        fontWeight: 600,
        fontFamily: "Lato"
    }
  });

const Friend = (props) => {
    const classes = useStyles()

    return (
        <Link to={`/profile/${props.friend.user.id}`}>
            <div className="friend-chat">
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={props.friend.user.avatar}>{props.friend.user.first_name.charAt(0)}{props.friend.user.last_name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                        primaryTypographyProps={{className: classes.primary}}
                        primary={props.friend.user.first_name} 
                        secondary={
                            <>
                                <Typography component="span" color="inherit" variant="body2"> 
                                    {props.friend.user.email + " "}
                                </Typography>
                            </>
                        }
                    >
                    </ListItemText>
                    {props.isUserFriend && <Link to={`/chat/${props.friend.chat_room}`}>
                            <Tooltip title="Chat">
                                <IconButton color="primary">
                                    <ChatIcon></ChatIcon>
                                </IconButton>
                            </Tooltip>
                        </Link>
                    }
                </ListItem>
            </div>
        </Link>
    )
}

export default Friend