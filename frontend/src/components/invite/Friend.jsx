import React, {useState} from "react";
import { Link } from "react-router-dom";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Menu, 
  MenuItem,
  ListItemIcon
} from "@material-ui/core";
import { Chat as ChatIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon } from "@material-ui/icons";
import { friendPropType } from "../../constants/prop-types";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import styles from "../../styles/friends.module.css";

const Friend = (props) => {
  const history = useHistory();
  const [settings, openSettings] = useState(null)
  const open = Boolean(settings);

  const handleOpen = (e) => {
    e.preventDefault()
    openSettings(e.currentTarget)
  }

  const handleClose = (e) => {
    e.preventDefault()
    openSettings(null)
  }

  const handleChat = (e) => {
    e.preventDefault();
    history.push(`/chat/${props.friend.chat_room}`);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    props.deleteFriend(props.user.id, props.friend.id);
  };

  return (
    <Link to={`/profile/${props.friend.user.id}`}>
      <div className={styles.chat}>
        <ListItem>
          <ListItemAvatar>
            <Avatar src={props.friend.user.avatar}>
              {props.friend.user.first_name.charAt(0)}
              {props.friend.user.last_name.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={props.friend.user.first_name}
            secondary={
              <>
                <Typography component="span" color="inherit" variant="body2">
                  {props.friend.user.email + " "}
                </Typography>
              </>
            }
          />
          <IconButton style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={handleOpen}>
              <MoreVertIcon/>
          </IconButton>
          <Menu 
              anchorEl={settings} 
              open={open} 
              onClose={handleClose}
          >
            {props.isUserFriend && 
              <MenuItem onClick={(e) => {handleChat(e); handleClose(e)}}>
                  <ListItemIcon>
                      <ChatIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2" noWrap>
                      Send Message
                  </Typography>
              </MenuItem>
            }
            {props.isUserFriend && 
              <MenuItem onClick={(e) => {handleDelete(e); handleClose(e)}}>
                <ListItemIcon>
                    <DeleteIcon color="secondary" fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" noWrap>
                    Delete
                </Typography>
              </MenuItem>
            }
          </Menu>
        </ListItem>
      </div>
    </Link>
  );
};

Friend.propTypes = {
  friend: friendPropType,
  isUserFriend: PropTypes.bool.isRequired,
};

export default Friend;
