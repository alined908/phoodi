import React, {Component} from 'react'
import moment from 'moment';
import {Avatar} from "@material-ui/core"
import {userPropType, chatMessagePropType, chatMemberPropType} from "../../constants/prop-types"

class ChatMessageComponent extends Component {
    render (){
        const message = this.props.message
        let user_obj = this.props.user
        var is_user_msg = user_obj.id === message.sender_id
        const user = this.props.members[message.sender_id]

        return (
            <div className={`chat-msg-wrapper ${is_user_msg ? "is-user": ""}`}>
                {!is_user_msg && <div className="chat-msg-avatar">
                    <Avatar src={user.avatar}>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</Avatar>
                </div>}
                <div>
                    <div className={`chat-msg-info ${is_user_msg ? "is-user": ""}`}>
                        <div className="chat-msg-id">
                            {user.first_name}
                        </div>
                        <div className="chat-msg-time">
                            {moment(message.timestamp).local().format("MMM DD hh:mm A")}
                        </div>
                    </div>
                    <div className={`chat-msg elevate ${is_user_msg ? "is-user": ""}`}>{message.message}</div>
                </div>
                {is_user_msg && <div className="chat-msg-avatar is-user">
                    <Avatar src={user.avatar}>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</Avatar>
                </div>}
            </div>
        )
    }
}

ChatMessageComponent.propTypes = {
    user: userPropType,
    message: chatMessagePropType,
    members: chatMemberPropType
}

export default ChatMessageComponent