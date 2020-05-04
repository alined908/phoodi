import React, { Component } from "react";
import { ChatWindow } from "../components";
import {
  getMessages,
  addMessage,
  setActiveRoom,
  getRoom,
  removeActiveRoom,
} from "../../actions";
import AuthenticationService from "../../accounts/AuthenticationService";
import WebSocketService from "../../accounts/WebSocket";
import { connect } from "react-redux";
import styles from "../../styles/meetup.module.css";

class MeetupChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatSocket: new WebSocketService(),
    };
    this.state.chatSocket.addChatCallbacks(
      this.props.getMessages,
      this.props.addMessage
    );
  }

  componentDidMount() {
    const uri = this.props.meetup.uri;
    const chatPath = `/ws/chat/${uri}/`;
    const token = AuthenticationService.retrieveToken();
    this.state.chatSocket.connect(chatPath, token);
    this.getRoomInfo(uri);
  }

  getRoomInfo(uri) {
    this.props.getRoom(uri);
    this.props.setActiveRoom(uri);
    this.props.getMessages(uri);
  }

  componentWillUnmount() {
    this.props.removeActiveRoom();
    this.state.chatSocket.disconnect();
  }

  render() {
    const renderChatWindow = () => {
      if (this.props.isMessagesInitialized || this.props.isMessagesFetching) {
        return (
          <ChatWindow
            meetup={true}
            hideChat={this.props.hideChat}
            messages={this.props.messages}
            socket={this.state.chatSocket}
            activeRoom={this.props.activeRoom}
            isMessagesInitialized={this.props.isMessagesInitialized}
          />
        );
      } else {
        return (
          <ChatWindow
            meetup={true}
            socket={this.state.socket}
            activeRoom={null}
            messages={[]}
          />
        );
      }
    };

    return <div className={styles.meetupChat}>{renderChatWindow()}</div>;
  }
}

const mapStateToProps = (state) => {
  return {
    isMessagesFetching: state.chat.isMessagesFetching,
    isMessagesInitialized: state.chat.isMessagesInitialized,
    activeRoom: state.chat.activeRoom,
    messages: state.chat.messages,
  };
};

const mapDispatchToProps = {
  getMessages,
  addMessage,
  setActiveRoom,
  getRoom,
  removeActiveRoom,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetupChat);
export { MeetupChat as UnderlyingMeetupChat };
