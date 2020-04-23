import React from "react"
import {Link} from "react-router-dom"
import {ListItem, ListItemAvatar, ListItemText, Tooltip, Typography, Avatar, makeStyles, IconButton} from '@material-ui/core'
import {Chat as ChatIcon, Delete as DeleteIcon} from '@material-ui/icons';
import {friendPropType} from '../../constants/prop-types'
import PropTypes from 'prop-types'
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
    primary: {
        fontWeight: 600,
        fontFamily: "Lato"
    }
  });

const Friend = (props) => {
    const classes = useStyles()
    const history = useHistory();

    const handleClick = (e) => {
        e.preventDefault()
        history.push(`/chat/${props.friend.chat_room}`)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        props.deleteFriend(props.user.id, props.friend.id)
    }

    return (
        <Link to={`/profile/${props.friend.user.id}`}>
            <div className="friend-chat">
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={props.friend.user.avatar}>
                            {props.friend.user.first_name.charAt(0)}
                            {props.friend.user.last_name.charAt(0)}
                        </Avatar>
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
                    {props.isUserFriend && 
                        <Tooltip title="Chat">
                            <IconButton color="primary" onClick={handleClick}>
                                <ChatIcon/>
                            </IconButton>
                        </Tooltip>
                    }
                    {props.isUserFriend && 
                        <Tooltip title="Delete Friend">
                            <IconButton color="secondary" onClick={handleDelete}>
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    }
                </ListItem>
            </div>
        </Link>
    )
}

Friend.propTypes = {
    friend: friendPropType,
    isUserFriend: PropTypes.bool.isRequired
}

export default Friend