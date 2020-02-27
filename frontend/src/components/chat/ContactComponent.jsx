import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Link} from 'react-router-dom'
import {roomType} from '../../constants/default-states'
import Badge from '@material-ui/core/Badge';
import {removeNotifs} from "../../actions/notifications"

class ContactComponent extends Component {

    handleClick = (uri) => {
        this.props.removeNotifs(uri)
    }

    render (){
        const [id, uri, name, timestamp, members, friend, meetup, notifs] = this.props.room
        const current_room = this.props.currentRoom === uri

        return (
            <Link to={`/chat/${uri}`} onClick={notifs > 0 ? () => this.handleClick(uri): null} className="contact-link" >
                <div className={`chat-contact ${current_room ? 'curr-room': ""}`}>
                    <div>{name}</div>
                    {meetup ? 
                        <>{Object.keys(members).length + " Members"}</> : 
                        <>{Object.keys(members).map((member) => 
                            (member !== this.props.user.id.toString()) ? 
                                <div className="chat-contact-info">
                                    <div className="chat-contact-avatar"><img src={members[member].avatar} className="user-avatar-sm"></img></div>
                                    <div>{members[member].first_name + " " + members[member].email}</div>
                                    <div><Badge color="primary" badgeContent={notifs}></Badge></div>
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

const mapDispatchToProps = {
    removeNotifs
}

function mapStateToProps(state){
    return {
        user: state.user.user,
        currentRoom: state.chat.activeRoom
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactComponent)