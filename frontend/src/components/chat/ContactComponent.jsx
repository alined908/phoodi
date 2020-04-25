import React, {Component} from 'react'
import {connect} from 'react-redux';
import {Link} from 'react-router-dom'
import {Avatar, Badge} from '@material-ui/core';
import {removeNotifs} from "../../actions/notifications"
import NotificationsIcon from '@material-ui/icons/Notifications';
import {GroupAvatars} from '../components'
import moment from 'moment'
import PropTypes from 'prop-types';
import {userPropType, chatRoomPropType} from "../../constants/prop-types"

class ContactComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            notifs: this.props.room.notifs
        }
    }

    handleClick = (id) => {
        this.setState({notifs: 0}, 
            () => this.props.removeNotifs({type: "chat_message", id: id})
        )  
    }

    render (){
        const room = this.props.room
        const current_room = this.props.currentRoom === room.uri
        const membersKeys = Object.keys(room.members)

        return (
            <Link key={room.id} to={`/chat/${room.uri}`} onClick={room.notifs > 0 ? () => this.handleClick(room.id): null} className="contact-link" >
                <div className={`chat-contact ${current_room ? 'curr-room': ""}`}>
                    <div>
                        {room.name}
                    </div>
                    {room.meetup ? 
                        <div className="meetup-avatars light-text">
                            <GroupAvatars members={Object.values(room.members)}/>
                            {membersKeys.length + " member"}{membersKeys.length > 1 ? "s" : ""}
                        </div> : 
                        <>{membersKeys.map((member) => 
                            (member !== this.props.user.id.toString()) ? 
                                <div key={member} className="chat-contact-info">
                                    <div className="chat-contact-avatar">
                                        <Avatar src={room.members[member].avatar}>
                                            {room.members[member].first_name.charAt(0)}{room.members[member].last_name.charAt(0)}
                                        </Avatar>
                                    </div>
                                    <div className="chat-contact-user-info">
                                        <div>
                                            {room.members[member].first_name}
                                        </div>
                                        <div className="light-text">
                                            {room.members[member].email}
                                        </div>
                                    </div>
                                </div> : ""
                            )}
                        </>
                    }
                    <div>
                        {moment(room.last_updated).fromNow()}
                    </div>
                    {this.state.notifs > 0 && 
                        <div className="chat-contact-notifications">
                            <Badge color="secondary" variant="dot" badgeContent={this.state.notifs}>
                                <NotificationsIcon/>
                            </Badge>
                        </div>
                    }
                </div>
            </Link>
        )
    }
}

ContactComponent.propTypes = {
    room: chatRoomPropType,
    user: userPropType,
    currentRoom: PropTypes.string,
    removeNotifs: PropTypes.func
}

const mapDispatchToProps = {
    removeNotifs
}

function mapStateToProps(state){
    return {
        currentRoom: state.chat.activeRoom
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactComponent)
export {ContactComponent as UnderlyingContactComponent}