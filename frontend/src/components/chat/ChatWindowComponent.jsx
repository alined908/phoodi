import React, {Component} from 'react'
import ChatMessageComponent from "./ChatMessageComponent"
import {connect} from 'react-redux'
import WebSocketInstance from '../../accounts/WebSocket'
import {setTypingValue, addMessage, getMessages} from "../../actions/chat";

class ChatWindowComponent extends Component {
    constructor(props){
        super(props)
        console.log("chat window constructor")
        console.log(this.props.user)
        let user = this.props.user
        WebSocketInstance.initChatUser(user.email);
        WebSocketInstance.addCallbacks(this.props.getMessages, this.props.addMessage)
        // WebSocketInstance.fetchMessages(user.email);
    }
    
    handleChange = (e) => {
        console.log(e.target.value);
        this.props.setTypingValue(e.target.value);        
    }

    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            console.log("handle submit")
            const messageObject = {from: JSON.parse(this.props.user).id, text: this.props.message, room: this.props.room}
            console.log(messageObject)
            WebSocketInstance.newChatMessage(messageObject)
            // this.props.addMessage(e.target.value, this.props.room, JSON.parse(this.props.user).id)
        }
    }

    componentDidMount() {
        this.scrollToBottom();
      }
    componentDidUpdate() {
        this.scrollToBottom();
    }
    scrollToBottom = () => {    
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
                    <form className="chat-input-form">
                        <input className="chat-input"
                            type="text"
                            onChange={this.handleChange} 
                            onKeyPress={this.handleSubmit}
                            value={this.props.message} 
                            placeholder="Type here to send a message">
                        </input>
                    </form>
                </div>}
            </div>
        )
    }
}

function mapStateToProps(state){
    if (state.chat.activeRoom in state.chat.rooms){
        return {
            activeChatMembers: state.chat.rooms[state.chat.activeRoom].members,
            user: state.user.user,
            message: state.chat.setTypingValue,
            room: state.chat.activeRoom
        }
    } else {
        return {
            activeChatMembers: null,
            user: state.user.user,
        }
    }
    
}

const mapDispatchToProps = {
    setTypingValue,
    addMessage,
    getMessages
}


export default connect(mapStateToProps, mapDispatchToProps)(ChatWindowComponent)