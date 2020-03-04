import React, {Component} from 'react'
import ChatBarComponent from "./ChatBarComponent"
import ChatWindowComponent from "./ChatWindowComponent"
import {connect} from "react-redux";
import {getMessages, setActiveRoom, addMessage, removeActiveRoom} from "../../actions/chat"
import {getRooms} from '../../actions/chat';
import WebSocketService from "../../accounts/WebSocket"

class ChatComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService()
        }
        this.state.socket.addChatCallbacks(this.props.getMessages, this.props.addMessage)
    }

    componentDidMount(){
        this.props.getRooms()
        if("uri" in this.props.match.params){
            this.getRelevantInfo(this.props.match.params.uri)
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.uri != prevProps.match.params.uri){
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
        this.props.setActiveRoom(uri);
        this.props.getMessages(uri);
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/chat/${this.props.match.params.uri}/`;
        socket.connect(path);
    }

    render(){
        const renderChatWindow = () => {
            if (this.props.isMessagesInitialized) {
                return <ChatWindowComponent socket={this.state.socket} isMessagesInitialized={this.props.isMessagesInitialized} activeRoom={this.props.activeRoom} messages={this.props.messages}></ChatWindowComponent>
            } else {
                return <ChatWindowComponent socket={this.state.socket} activeRoom={null}></ChatWindowComponent>
            }
        }

        return (
            <div className="chat">
                <ChatBarComponent rooms={this.props.rooms}/>
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
        rooms: Object.values(state.chat.rooms)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatComponent)