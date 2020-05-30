import React, { Component } from "react";
import moment from "moment";
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, Typography} from "@material-ui/core";
import {MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon} from '@material-ui/icons';
import styles from "../../styles/chat.module.css";
import {
  userPropType,
  chatMessagePropType,
  chatMemberPropType,
} from "../../constants/prop-types";

class ChatMessageTools extends Component {
  constructor(props){
    super(props);
    this.state = {
      open: false,
      anchorRef: null
    }
  }

  handleClick = (e) => {
    this.setState({anchorRef: e.currentTarget})
  }

  handleClose = (e) => {
    this.setState({anchorRef: null})
  }

  handleEdit = (e) => {
    console.log('edit')
  }

  handleDelete = (e) => {
    console.log('delete')
  }

  render () {
    return (
      <div className={styles.messageTools}>
        {this.props.hover &&
          <IconButton size="small" color="primary" onClick={this.handleClick}>
            <MoreVertIcon />
          </IconButton>
        }
        {Boolean(this.state.anchorRef) && 
          <Menu 
            anchorEl={this.state.anchorRef} 
            open={true}
            onClose={this.handleClose}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            getContentAnchorEl={null}
          >
            <MenuItem onClick={(e) => {this.handleEdit(e); this.handleClose()}}>
              <ListItemIcon>
                <EditIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" noWrap>
                Edit Message
              </Typography>
              
            </MenuItem>
            <MenuItem onClick={(e) => {this.handleDelete(e); this.handleClose()}}>
              <ListItemIcon>
                <DeleteIcon color="secondary" fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" noWrap>
                Delete Message
              </Typography>
            </MenuItem>
          </Menu>
        }
      </div>
    )
  }
}

class ChatMessage extends Component {
  constructor(props){
    super(props);
    this.state = {
      hover:false
    }
  }

  toggleHover = (hover) => {
    this.setState({hover})
  }

  render() {
    const message = this.props.message;
    const sender = message.sender;
    // const isUser = this.props.user.id === sender.id
   
    return (
      <div
        id={`${message.id}`}
        className={`
          ${message.is_notif ? 
          (this.props.hideNotif ? 
            styles.messageNotifHide : 
            styles.messageNotifWrapper) : 
          styles.messageWrapper} ${this.state.hover ? styles.messageWrapperHover : ""}
          `
        }
        onMouseEnter={() => this.toggleHover(true)} 
        onMouseLeave={() => this.toggleHover(false)}
      >
        <Avatar className={styles.messageAvatar} src={sender.avatar}>
          {sender.first_name.charAt(0)}
          {sender.last_name.charAt(0)}
        </Avatar>
        <div className={styles.messageInner}>
          <div className={styles.messageInfo}>
            <div className={styles.messageUser}>
              {sender.first_name} {sender.last_name}
            </div>
            <div className={styles.messageTime}>
              {moment(message.timestamp).calendar()}
            </div>
          </div>
          <div className={styles.message}>
            {message.message}
          </div>
        </div>
        <ChatMessageTools hover={this.state.hover}/>
      </div>
    );
  }
}

ChatMessage.propTypes = {
  user: userPropType,
  message: chatMessagePropType,
  members: chatMemberPropType,
};

export default ChatMessage;
