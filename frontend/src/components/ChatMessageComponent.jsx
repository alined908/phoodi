import React, {Component} from 'react'
import moment from 'moment';

class ChatMessageComponent extends Component {
    render (){
        const [id, message, timestamp, is_read, room, sender, receipient] = Object.values(this.props.message)
        console.log(this.props.user)
        let user = JSON.parse(this.props.user);

        var is_user_msg = user.id === sender
    
        if (is_user_msg){
            var name = user.first_name
        } else {
            var name = this.props.members[sender].first_name
        }

        return (
            <div className={`chat-msg-wrapper ${is_user_msg ? "is-user": ""}`}>
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
        )
    }
}


export default ChatMessageComponent