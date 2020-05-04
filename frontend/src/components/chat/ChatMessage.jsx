import React, { Component } from "react";
import moment from "moment";
import { Avatar } from "@material-ui/core";
import styles from "../../styles/chat.module.css";
import {
  userPropType,
  chatMessagePropType,
  chatMemberPropType,
} from "../../constants/prop-types";

class ChatMessage extends Component {
  render() {
    const message = this.props.message;
    const sender = message.sender;
    // const isUser = this.props.user.id === sender.id
   
    return (
      <div
        id={`${message.id}`}
        className={
          message.is_notif ? 
          (this.props.hideNotif ? 
            styles.messageNotifHide : 
            styles.messageNotifWrapper) : 
          styles.messageWrapper
        }
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
          <div className={styles.message}>{message.message}</div>
        </div>
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
