import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Link} from 'react-router-dom'
import {roomType} from '../../constants/default-states'

class ContactComponent extends Component {

    render (){
        const [id, uri, name, timestamp, members, friend, meetup] = this.props.room
        const current_room = this.props.currentRoom === uri

        return (
            <Link to={`/chat/${uri}`}>
                <div className={`chat-contact ${current_room ? 'curr-room': ""}`}>
                    <div>{name}</div>
                    {meetup ? 
                        <>{Object.keys(members).length + " Members"}</> : 
                        <>{Object.keys(members).map((member) => 
                            (member !== this.props.user.id.toString()) ? 
                                <div className="chat-contact-info">
                                    <div className="chat-contact-avatar"><img src={members[member].avatar} className="user-avatar-sm"></img></div>
                                    <div>{members[member].first_name + " " + members[member].email}</div>
                                </div> : 
                                ""
                            )}
                        </>
                    }
                </div>
            </Link>
        )
    }
}

function mapStateToProps(state){
    return {
        user: state.user.user,
        currentRoom: state.chat.activeRoom
    }
}

export default connect(mapStateToProps)(ContactComponent)