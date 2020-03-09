import React, {Component} from 'react'
import moment from 'moment';
import {Avatar} from "@material-ui/core"

class ChatMessageComponent extends Component {
    render (){
        const [id, message, timestamp, is_read, room, sender, receipient] = Object.values(this.props.message)
        let user = this.props.user
        var is_user_msg = user.id === sender
    
        if (is_user_msg){
            var name = user.first_name
        } else {
            var name = this.props.members[sender].first_name
        }

        return (
            <div className={`chat-msg-wrapper ${is_user_msg ? "is-user": ""}`}>
                {!is_user_msg && <div className="chat-msg-avatar">
                    <img src={user.avatar} className="user-avatar-xs"/>
                </div>}
                <div>
                    <div className={`chat-msg-info ${is_user_msg ? "is-user": ""}`}>
                        <div className="chat-msg-id">
                            {name}
                        </div>
                        <div className="chat-msg-time">
                            {moment(timestamp).local().format("MMM DD hh:mm A")}
                        </div>
                    </div>
                    <div className={`chat-msg ${is_user_msg ? "is-user": ""}`}>{message}</div>
                </div>
                {is_user_msg && <div className="chat-msg-avatar is-user">
                    <Avatar src={user.avatar}>{user.first_name.charAt(0)}</Avatar>
                </div>}
            </div>
        )
    }
}


export default ChatMessageComponent