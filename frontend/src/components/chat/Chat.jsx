import React, { Component } from 'react'
import { ChatBar, ChatWindow } from "../components"
import { connect } from "react-redux";
import {getMessages, setActiveRoom, addMessage, removeActiveRoom, getRooms} from "../../actions"
import WebSocketService from "../../accounts/WebSocket"
import AuthenticationService from '../../accounts/AuthenticationService';
import { Helmet } from "react-helmet"
import styles from '../../styles/chat.module.css'

class Chat extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService(),
            nonMobile: window.matchMedia("(min-width: 768px)").matches
        }
        this.state.socket.addChatCallbacks(this.props.getMessages, this.props.addMessage)
    }

    componentDidMount(){
        const handler = e => this.setState({nonMobile: e.matches});
        window.matchMedia("(min-width: 768px)").addListener(handler);
        this.props.getRooms()
        if("uri" in this.props.match.params){
            this.getRelevantInfo(this.props.match.params.uri)
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.uri !== prevProps.match.params.uri){
            if (this.state.socket.exists()){
                this.state.socket.disconnect()
            }
            this.getRelevantInfo(this.props.match.params.uri)
        }
    }

    componentWillUnmount(){
        this.props.removeActiveRoom()
        this.state.socket.disconnect()
    }

    getRelevantInfo(uri) {
        const socket = this.state.socket
        const token = AuthenticationService.retrieveToken()
        const path = `/ws/chat/${this.props.match.params.uri}/`;
        socket.connect(path, token);
        this.setRoomInfo(uri)
    }

    setRoomInfo(uri){
        this.props.setActiveRoom(uri);
        this.props.getMessages(uri);
    }

    render(){
        const renderChatWindow = () => {
            if (this.props.isMessagesInitialized || this.props.isMessagesFetching) {
                return <ChatWindow
                            socket={this.state.socket} isMessagesInitialized={this.props.isMessagesInitialized} 
                            activeRoom={this.props.activeRoom} messages={this.props.messages}
                        />
            } else {
                return <ChatWindow socket={this.state.socket} activeRoom={null} messages={[]}/>
            }
        }

        return (
            <div className={`${styles.chat}` + (this.state.nonMobile ? "" : "chat-mobile")}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Chat</title>
                    <meta name="description" content="Phoodie Chat" />
                </Helmet>
                <ChatBar rooms={this.props.rooms}/>
                {renderChatWindow()}
            </div>
        )
    }
}

const mapDispatchToProps = {
    setActiveRoom,
    getMessages,
    getRooms,
    addMessage,
    removeActiveRoom
}

function mapStateToProps(state){
    return {
        isMessagesInitialized: state.chat.isMessagesInitialized,
        activeRoom: state.chat.activeRoom,
        messages: state.chat.messages,
        isActiveRoomSet: state.chat.isActiveRoomSet,
        rooms: Object.values(state.chat.rooms),
        isMessagesFetching: state.chat.isMessagesFetching
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
export {Chat as UnderlyingChat}