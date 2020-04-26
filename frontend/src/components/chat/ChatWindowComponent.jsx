import React, {Component} from 'react'
import {ChatMessageComponent, ChatInput} from "../components"
import {connect} from 'react-redux'
import {Button, Tooltip, CircularProgress} from '@material-ui/core'
import {Link} from 'react-router-dom';
import {removeNotifs} from "../../actions/notifications"
import {getMoreMessages} from "../../actions/chat"
import {Person as PersonIcon, Event as EventIcon} from "@material-ui/icons"
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle'
import moment from "moment"
import {chatMessagePropType} from "../../constants/prop-types"
import {Helmet} from 'react-helmet'

class ChatWindowComponent extends Component {
    constructor(props){
        super(props);
        this.state = {
            bound: true,
            offset: 0
        }
        this.firstMessageRef = React.createRef();
        this.messagesEndRef = React.createRef();
        this.handleScrollWrapper = this.handleScrollWrapper.bind(this)
        this.delayedCallback = throttle(this.handleScroll, 300)
        this.bound = true
    }

    //If chat window state is bound, scroll to bottom on new chat messages
    componentDidUpdate(prevProps) {
        if (this.state.bound){
            this.scrollToBottom();
        }
        if (prevProps.isMoreMessagesFetching && !this.props.isMoreMessagesFetching){
            this.scrollToOldFirst(this.state.offset)
        }
    }

    scrollToOldFirst = () => {
        const first = document.getElementById(this.state.offset.toString())
        first.scrollIntoView()
    }

    //Scroll function to determine bound state and get more messages if necessary
    handleScroll = (e) => {
        let scrollTop = e.target.scrollTop;
        let scrollHeight = e.target.scrollHeight;
        let clientHeight = e.target.clientHeight;
        
        //Check if more is retrievable
        if (scrollTop === 0 && this.props.messages && this.props.isMoreRetrievable) {
            this.setState({offset: this.props.messages[0].id})
            this.props.getMoreMessages(this.props.room.uri, this.props.messages[0].id)
        }

        let newBound = (scrollHeight - scrollTop === clientHeight)
        if (newBound !== this.bound){
            this.setState({bound: newBound})
            this.bound = newBound
        } 
    }

    //Scroll wrapper to throttle and persist synthetic event
    handleScrollWrapper = (event) => {
        event.persist()
        this.delayedCallback(event)
    }

    //Scroller if bound
    scrollToBottom = (behavior = "smooth") => {    
        this.messagesEndRef.current.scrollIntoView({behavior});
    };

    //Determine non self user if chat room is friendship
    determineOtherUser = () => {
        const user = this.props.user

        for (var key in this.props.room.members){
            if (key !== user.id.toString()){
                return this.props.room.members[key].id
            }
        }
    }

    groupMessagesByDate = (messages) => {
        const mapping = {}

        for(var i = 0; i < messages.length; i++){
            let message = messages[i]
            let date = moment(message.timestamp).local().format('MMMM D, YYYY')
            if (date in mapping){
                mapping[date].push(message)
            }
            else {
                mapping[date] = [message]
            }   
        }
        return mapping  
    }
 
    render () {

        const messagesByDate = (this.props.messages) ? this.groupMessagesByDate(this.props.messages) : {}

        return (
            <div className="chat-window elevate" ref={this.chatsRef}>
                {(this.props.activeRoom && this.props.room) && 
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>{`Chat - ${this.props.room.name ? this.props.room.name : this.props.room.members[this.determineOtherUser()].first_name}`}</title>
                        <meta name="description" content="Phoodie Chat" />
                    </Helmet>
                }
                <div className="chat-header">
                    {this.props.room && this.props.room.meetup && 
                        <Link to={`/meetups/${this.props.room.uri}`}>
                            <Tooltip title="Go to Meetup">
                                <Button color="primary" startIcon={<EventIcon/>}>
                                  Meetup
                                </Button>
                            </Tooltip>
                        </Link>
                    }
                    {this.props.room && this.props.room.friendship && 
                        <Link to={`/profile/${this.determineOtherUser()}`}>
                            <Tooltip title="Go to Profile">
                                <Button color="primary" startIcon={<PersonIcon/>}>Profile</Button>
                            </Tooltip>
                        </Link>
                    }
                </div>
                <div className="chat-messages-wrapper" onScroll={this.handleScrollWrapper} ref={this.messagesRef}>
                    {this.props.isMessagesFetching ? 
                        <div className="loading">
                            <CircularProgress/>
                            <div ref={this.messagesEndRef} />
                        </div>
                        :
                        <div className="chat-messages">
                            {this.props.isMoreMessagesFetching && 
                                <div className="chat-loading">
                                    <CircularProgress/>
                                </div>
                            }
                            {(this.props.room && !this.props.isMoreRetrievable) && 
                                <div className="chat-messages-header">
                                    {this.props.room.friendship ? 
                                        <>
                                            <span>This is the beginning of your direct message history with &nbsp;</span>
                                            <span className="chat-messages-header-var">
                                                {this.props.room.members[this.determineOtherUser()].first_name} {this.props.room.members[this.determineOtherUser()].last_name}
                                            </span>
                                            <span>.</span>
                                        </> : 
                                        <>
                                            <span>Welcome to the beginning of the &nbsp;</span>
                                            <span className="chat-messages-header-var">{this.props.room.name}</span>
                                            <span>&nbsp; group.</span>
                                        </>
                                    }
                                </div>
                            }
                            {this.props.activeChatMembers && Object.keys(messagesByDate).map((date, index) => 
                                <React.Fragment key={index}>
                                    <div className="chat-messages-date">
                                        {date}
                                    </div>
                                    {messagesByDate[date].map((msg, i) => 
                                        <ChatMessageComponent 
                                            key={msg.id} 
                                            user={this.props.user} 
                                            message={msg} 
                                            members={this.props.activeChatMembers}
                                        />
                                    )}
                                </React.Fragment>
                            )}
                            <div ref={this.messagesEndRef} />
                        </div>
                    }
                </div>
                {this.props.activeRoom ? 
                    <div ref={(el) => { this.messagesEnd = el; }} className="chat-input-wrapper">
                        <ChatInput 
                            user={this.props.user} 
                            room={this.props.room} 
                            socket={this.props.socket} 
                            bound={this.state.bound} 
                            scrollToBottom={() => this.scrollToBottom("auto")}
                        />
                    </div> :
                    <div className="chat-input"> 

                    </div>
                }
            </div>
        )
    }
}

ChatWindowComponent.propTypes = {
    socket: PropTypes.object.isRequired,
    isMessagesInitialized: PropTypes.bool,
    activeRoom: PropTypes.string,
    messages: PropTypes.arrayOf(
        chatMessagePropType
    ),
    removeNotifs: PropTypes.func,
    getMoreMessages: PropTypes.func,
    isMessagesFetching: PropTypes.bool,
    isMoreMessagesFetching: PropTypes.bool
}

function mapStateToProps(state){
    if (state.chat.activeRoom in state.chat.rooms){
        return {
            activeChatMembers: state.chat.rooms[state.chat.activeRoom].members,
            user: state.user.user,
            isMessagesFetching: state.chat.isMessagesFetching,
            room: state.chat.rooms[state.chat.activeRoom],
            isMoreMessagesFetching: state.chat.isMoreMessagesFetching,
            isMoreRetrievable: state.chat.isMoreRetrievable
        }
    } else {
        return {
            activeChatMembers: null,
            user: state.user.user,
            isMessagesFetching: state.chat.isMessagesFetching
        }
    }
    
}

const mapDispatchToProps = {
    removeNotifs,
    getMoreMessages
}


export default connect(mapStateToProps, mapDispatchToProps)(ChatWindowComponent)
export {ChatWindowComponent as UnderlyingChatWindowComponent}