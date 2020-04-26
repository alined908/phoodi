import React, {Component} from 'react'
import {ChatWindowComponent} from '../components'
import {getMessages, addMessage, setActiveRoom, getRoom} from "../../actions/chat"
import AuthenticationService from "../../accounts/AuthenticationService"
import WebSocketService from "../../accounts/WebSocket";
import {connect} from 'react-redux'

class MeetupChat extends Component {
    constructor(props){
        super(props)
        this.state = {
            chatSocket: new WebSocketService(),
        }
    }

    componentDidMount() {
        const uri = this.props.meetup.uri
        this.getRoomInfo(uri)
        const chatSocket = this.state.chatSocket
        const chatPath = `/ws/chat/${uri}/`;
        const token = AuthenticationService.retrieveToken()
        chatSocket.addChatCallbacks(this.props.getMessages, this.props.addMessage)
        chatSocket.connect(chatPath, token)
    }

    getRoomInfo(uri){
        this.props.getRoom(uri);
        this.props.setActiveRoom(uri);
        this.props.getMessages(uri);
    }

    componentWillUnmount(){
        this.state.chatSocket.disconnect()
    }

    render () {
        const renderChatWindow = () => {
            if (this.props.isMessagesInitialized || this.props.isMessagesFetching) {
                return <ChatWindowComponent 
                            socket={this.state.chatSocket} isMessagesInitialized={this.props.isMessagesInitialized} 
                            activeRoom={this.props.activeRoom} messages={this.props.messages}
                        />
            } else {
                return <ChatWindowComponent socket={this.state.socket} activeRoom={null} messages={[]}/>
            }
        }

        return (
            <div>
                {renderChatWindow()}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        isMessagesInitialized: state.chat.isMessagesInitialized,
        activeRoom: state.chat.activeRoom,
        messages: state.chat.messages,
        isMessagesFetching: state.chat.isMessagesFetching
    }
}

const mapDispatchToProps = {
    getMessages,
    addMessage,
    setActiveRoom,
    getRoom
}   

export default connect(mapStateToProps, mapDispatchToProps)(MeetupChat)