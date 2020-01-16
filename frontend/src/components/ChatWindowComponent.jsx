import React, {Component} from 'react'
import ChatMessageComponent from "./ChatMessageComponent"
import ChatInputComponent from "./ChatInputComponent"
import {connect} from 'react-redux'

class ChatWindowComponent extends Component {

    componentDidMount() {
        console.log("mounted chat window")
        this.scrollToBottom();
      }
    componentDidUpdate() {
        console.log("updated chat window")
        this.scrollToBottom();
    }
    scrollToBottom = () => {
        console.log("scroll to bottom called")
        this.messagesEnd && this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    };
    
    render () {
        return (
            <div className="chat-window" ref={this.chatsRef}>
                <div className="chat-header">
                    Conversation for uri: {this.props.activeRoom}
                </div>
                <div className="chat-messages">
                    {this.props.messages && this.props.messages.map((msg) => <ChatMessageComponent user={this.props.user} message={msg.message} members={this.props.activeChatMembers}/>)}
                </div>
                {this.props.activeChatMembers && <div ref={(el) => { this.messagesEnd = el; }} className="chat-input">
                    <ChatInputComponent/>
                </div>}
            </div>
        )
    }
}

function mapStateToProps(state){
    if (state.chat.activeRoom in state.chat.rooms){
        return {
            activeChatMembers: state.chat.rooms[state.chat.activeRoom].members,
            user: state.auth.user
        }
    } else {
        return {
            activeChatMembers: null,
            user: state.auth.user
        }
    }
    
}


export default connect(mapStateToProps)(ChatWindowComponent)