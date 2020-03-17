import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Link} from 'react-router-dom'
import {Avatar, Badge} from '@material-ui/core';
import {removeNotifs} from "../../actions/notifications"
import NotificationsIcon from '@material-ui/icons/Notifications';

class ContactComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            notifs: this.props.room[7]
        }
    }

    handleClick = (id) => {
        this.props.removeNotifs({type: "chat_message", id: id})
        this.setState({notifs: 0})  
    }

    render (){
        const [id, uri, name, timestamp, members, friend, meetup, notifs] = this.props.room
        const current_room = this.props.currentRoom === uri
        const membersKeys = Object.keys(members)

        return (
            <Link to={`/chat/${uri}`} onClick={notifs > 0 ? () => this.handleClick(id): null} className="contact-link" >
                <div className={`chat-contact ${current_room ? 'curr-room': ""}`}>
                    <div>{name}</div>
                    {meetup ? 
                        <div className="light-text">{membersKeys.length + " Member"}{membersKeys.length > 1 ? "s" : ""}</div> : 
                        <>{membersKeys.map((member) => 
                            (member !== this.props.user.id.toString()) ? 
                                <div className="chat-contact-info">
                                    <div className="chat-contact-avatar"><Avatar src={members[member].avatar}>{members[member].first_name.charAt(0)}{members[member].last_name.charAt(0)}</Avatar></div>
                                    <div className="chat-contact-user-info">
                                        <div>{members[member].first_name}</div>
                                        <div className="light-text">{members[member].email}</div>
                                    </div>
                        <div>{this.state.notifs > 0 && <Badge color="primary" badgeContent={this.state.notifs}><NotificationsIcon/></Badge>}</div>
                                </div> : ""
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