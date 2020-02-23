import React, {Component} from 'react'
import {connect} from 'react-redux';
import WebSocketInstance from '../../accounts/WebSocket'
import {Link} from 'react-router-dom'

class ContactComponent extends Component {

    render (){
        const [id, uri, name, timestamp, members] = this.props.room
        const current_room = this.props.currentRoom === uri

        return (
            <Link to={`/chat/${uri}`}>
                <div className={`chat-contact ${current_room ? 'curr-room': ""}`}>
                    <div>{name}</div>
                    <div>{Object.keys(members).length + " Members"}</div>
                </div>
            </Link>
        )
    }
}

function mapStateToProps(state){
    return {
        currentRoom: state.chat.activeRoom
    }
}

export default connect(mapStateToProps)(ContactComponent)