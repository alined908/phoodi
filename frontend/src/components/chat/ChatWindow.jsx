import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import moment from "moment"
import throttle from 'lodash/throttle'
import { ChatMessage, ChatInput } from "../components"
import { Button, IconButton, Tooltip, CircularProgress } from '@material-ui/core'
import { Person as PersonIcon, Event as EventIcon, ExitToApp as ExitToAppIcon } from "@material-ui/icons"
import { getMoreMessages, removeNotifs } from "../../actions"
import { chatMessagePropType } from "../../constants/prop-types"
import styles from '../../styles/chat.module.css'

class ChatWindow extends Component {
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
    }

    /*  
        Update component if new message comes in. 
        If chat window state is bound then scroll to bottom.
        Scroll to last message position if loading more messages. 
    */
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

    /* 
        Scroll handler function to determine bound state.
        Get more messages if necessary.
    */
    handleScroll = (e) => {
        let scrollTop = e.target.scrollTop;
        let scrollHeight = e.target.scrollHeight;
        let clientHeight = e.target.clientHeight;
        
        if (scrollTop === 0 && this.props.messages && this.props.isMoreRetrievable) {
            this.setState({offset: this.props.messages[0].id})
            this.props.getMoreMessages(this.props.room.uri, this.props.messages[0].id)
        }
        
        let newBound = (scrollHeight - scrollTop === clientHeight)
        if (newBound !== this.state.bound){
            this.setState({bound: newBound})
        } 
    }

    // Scroll wrapper to throttle and persist synthetic event
    handleScrollWrapper = (event) => {
        event.persist()
        this.delayedCallback(event)
    }

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

    /**
     * Group messages by date.
     * @param {Array.<Object>} messages
     */
    groupMessagesByDate = (messages) => {
        const mapping = {}

        for(var i = 0; i < messages.length; i++){
            let message = messages[i]
            let date = moment(message.timestamp).local().format('MMMM D, YYYY')
            if (date in mapping) {
                mapping[date].push(message)
            }
            else {
                mapping[date] = [message]
            }   
        }

        return mapping  
    }
 
    render () {

        const messagesByDate = this.groupMessagesByDate(this.props.messages)

        return (
            <div className={styles.window} ref={this.chatsRef}>
                <div className={styles.header}>
                    {!this.props.meetup && this.props.room && this.props.room.meetup && 
                        <Link to={`/meetups/${this.props.room.uri}`}>
                            <Tooltip title="Go to Meetup">
                                <Button color="primary" startIcon={<EventIcon/>}>
                                  Meetup
                                </Button>
                            </Tooltip>
                        </Link>
                    }
                    {!this.props.meetup && this.props.room && this.props.room.friendship && 
                        <Link to={`/profile/${this.determineOtherUser()}`}>
                            <Tooltip title="Go to Profile">
                                <Button color="primary" startIcon={<PersonIcon/>}>Profile</Button>
                            </Tooltip>
                        </Link>
                    }
                    {this.props.meetup && 
                        <>
                            <Tooltip title="Collapse">
                                <IconButton onClick={this.props.hideChat} color="primary">
                                    <ExitToAppIcon/>
                                </IconButton>
                            </Tooltip>
                            Meetup Chat
                        </>
                    }
                </div>
                <div className={styles.messagesWrapper} onScroll={this.handleScrollWrapper} ref={this.messagesRef}>
                    {this.props.isMessagesFetching ? 
                        <div className="loading">
                            <CircularProgress/>
                            <div ref={this.messagesEndRef} />
                        </div>
                        :
                        <div className={styles.messages}>
                            {this.props.isMoreMessagesFetching && 
                                <div className={styles.loading}>
                                    <CircularProgress/>
                                </div>
                            }
                            {(this.props.room && !this.props.isMoreRetrievable) && 
                                <div className={styles.messagesStart}>
                                    {this.props.room.friendship ? 
                                        <span>
                                            This is the beginning of your direct message history with 
                                            <span className={styles.messagesStartHighlight}>
                                                {this.props.room.members[this.determineOtherUser()].first_name} {this.props.room.members[this.determineOtherUser()].last_name}
                                            </span>
                                        </span>
                                         : 
                                        <span>
                                            Welcome to the beginning of the 
                                            <span className={styles.messagesStartHighlight}>
                                                {this.props.room.name}
                                            </span>
                                            group.
                                        </span>
                                    }
                                </div>
                            }
                            {this.props.activeChatMembers && Object.keys(messagesByDate).map((date, index) => 
                                <React.Fragment key={index}>
                                    <div className={styles.messagesDate}>
                                        {date}
                                    </div>
                                    {messagesByDate[date].map((msg) => 
                                        <ChatMessage
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
                {!this.state.bound && 
                    <div className={styles.scrollBottomHelper}>
                        <Button size="small" onClick={() => this.scrollToBottom("auto")}
                            className={styles.scrollBottom} 
                            variant="contained" color="primary"
                        >
                            Go Bottom
                        </Button>
                    </div>
                }
                {this.props.activeRoom ? 
                    <div ref={(el) => { this.messagesEnd = el; }} className={styles.inputWrapper}>
                        <ChatInput 
                            user={this.props.user} 
                            room={this.props.room} 
                            socket={this.props.socket} 
                        />
                    </div> :
                    <div className={styles.input}> 

                    </div>
                }
            </div>
        )
    }
}

ChatWindow.propTypes = {
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
    if (state.chat.activeRoom in state.chat.rooms) {
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


export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow)
export {ChatWindow as UnderlyingChatWindow}