import React, {Component} from 'react'
import moment from 'moment';
import {Avatar} from "@material-ui/core"

class ChatMessageComponent extends Component {
    render (){
        const [id, message, timestamp, is_read, room, sender, receipient] = Object.values(this.props.message)
        console.log(sender)
        let user_obj = this.props.user
        var is_user_msg = user_obj.id === sender
        const user = this.props.members[sender]

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
                            {moment(timestamp).local().format("MMM DD hh:mm A")}
                        </div>
                    </div>
                    <div className={`chat-msg ${is_user_msg ? "is-user": ""}`}>{message}</div>
                </div>
                {is_user_msg && <div className="chat-msg-avatar is-user">
                    <Avatar src={user.avatar}>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</Avatar>
                </div>}
            </div>
        )
    }
}


export default ChatMessageComponent