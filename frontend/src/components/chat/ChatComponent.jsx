import React, {Component} from 'react'
import ChatBarComponent from "./ChatBarComponent"
import ChatWindowComponent from "./ChatWindowComponent"
import {connect} from "react-redux";
import {getMessages} from "../../actions/chat"

class ChatComponent extends Component {
    render(){
        const renderChatWindow = () => {
            if (this.props.isMessagesInitialized) {
                return <ChatWindowComponent isMessagesInitialized={this.props.isMessagesInitialized} activeRoom={this.props.activeRoom} messages={this.props.messages}></ChatWindowComponent>
            } else {
                return <ChatWindowComponent activeRoom={""}></ChatWindowComponent>
            }
        }

        return (
            <div className="chat">
                <ChatBarComponent/>
                {renderChatWindow()}
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        isMessagesInitialized: state.chat.isMessagesInitialized,
        activeRoom: state.chat.activeRoom,
        messages: state.chat.messages,
        isActiveRoomSet: state.chat.isActiveRoomSet
    }
}

export default connect(mapStateToProps)(ChatComponent)