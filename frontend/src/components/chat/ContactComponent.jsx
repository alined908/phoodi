import React, {Component} from 'react'
import {connect} from 'react-redux';
import {setActiveRoom, getMessages} from '../../actions/chat';
import WebSocketInstance from '../../accounts/WebSocket'

class ContactComponent extends Component {
    handleClick = (uri) => {
        console.log("handle click")
        this.props.setActiveRoom(uri);

        //Websocket create connection for chat
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/chat/${uri}/`;
        WebSocketInstance.connect(path);

        this.props.getMessages(uri);
    }
    
    render (){
        const [id, uri, name, timestamp, members] = this.props.room
        const current_room = this.props.currentRoom === uri

        return (
            <div className={`chat-contact ${current_room ? 'curr-room': ""}`} onClick={() => this.handleClick(uri)}>
                <div>{name}</div>
                <div>{Object.keys(members).length + " Members"}</div>
            </div>
        )
    }
}
const mapDispatchToProps = {
    setActiveRoom,
    getMessages
}

function mapStateToProps(state){
    return {
        currentRoom: state.chat.activeRoom
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactComponent)