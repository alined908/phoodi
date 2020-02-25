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
                        <div>{Object.keys(members).length + " Members"}</div> : 
                        <div>{Object.keys(members).map((member) => 
                            (member !== this.props.user.id.toString()) ? 
                                <div>
                                    <img src={members[member].avatar} className="user-avatar-sm"></img>
                                    {members[member].first_name + " " + members[member].email}
                                </div> : 
                                ""
                            )}
                        </div>
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