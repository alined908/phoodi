import React, {Component} from 'react'
import ChatBarComponent from "./ChatBarComponent"
import ChatWindowComponent from "./ChatWindowComponent"
import {connect} from "react-redux";
import {getMessages, setActiveRoom} from "../../actions/chat"
import {getRooms} from '../../actions/chat';
import WebSocketInstance from "../../accounts/WebSocket"

class ChatComponent extends Component {

    constructor(props){
        super(props)
        this.props.getRooms()
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/chat/${this.props.match.params.uri}/`;
        WebSocketInstance.connect(path);
    }

    componentDidMount(){
        if("uri" in this.props.match.params){
            this.getRelevantInfo(this.props.match.params.uri)
        }
    }

    componentDidUpdate(prevProps){
        console.log("component did update")
        if (this.props.match.params.uri != prevProps.match.params.uri){
            this.getRelevantInfo(this.props.match.params.uri)
        }
    }

    getRelevantInfo(uri) {
        this.props.setActiveRoom(uri);
        this.props.getMessages(uri);
    }

    render(){
        const renderChatWindow = () => {
            if (this.props.isMessagesInitialized) {
                return <ChatWindowComponent isMessagesInitialized={this.props.isMessagesInitialized} activeRoom={this.props.activeRoom} messages={this.props.messages}></ChatWindowComponent>
            } else {
                return <ChatWindowComponent activeRoom={null}></ChatWindowComponent>
            }
        }
        console.log(this.props.isMessagesInitialized)

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
    getRooms
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