import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {ChatMessageComponent} from "../components"
import {connect} from 'react-redux'
import {Button, Tooltip} from '@material-ui/core'
import {Link} from 'react-router-dom';
import {removeNotifs} from "../../actions/notifications"
import {getMoreMessages} from "../../actions/chat"
import {Person as PersonIcon, Event as EventIcon} from "@material-ui/icons"
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import {chatMessagePropType} from "../../constants/prop-types"
import {Helmet} from 'react-helmet'

class ChatWindowComponent extends Component {
    constructor(props){
        super(props);
        this.state = {
            value: "",
            bound: true,
            showEmojis: false
        }
        this.emojiPicker = React.createRef();
        this.messagesEndRef = React.createRef();
        this.showEmojis = this.showEmojis.bind(this)
        this.handleScrollWrapper = this.handleScrollWrapper.bind(this)
        this.delayedCallback = throttle(this.handleScroll, 1000)
    }

    componentDidMount(){
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    componentDidUpdate() {
        if (this.state.bound){
            this.scrollToBottom();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }
    
    handleChange = (e) => {
        this.setState({value: e.target.value})       
    }

    sendMessage = () => {
        if (this.state.value.length > 0 ){
            const messageObject = {from: this.props.user.id, text: this.state.value, room: this.props.room.uri}
            this.setState({value: ""}, () => this.props.socket.newChatMessage(messageObject))
        } 
    }

    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            this.sendMessage()
        }
    }

    //Throttle this later
    handleScroll = (e) => {
        let scrollTop = e.target.scrollTop;
        let scrollHeight = e.target.scrollHeight;
        let clientHeight = e.target.clientHeight;

        console.log(scrollTop)
        if (scrollTop === 0 && this.props.messages && this.props.messages.length > 49) {
            console.log('hello')
            this.props.getMoreMessages(this.props.room.uri, this.props.messages[0].id)
        }

        if (scrollHeight - scrollTop === clientHeight){
            this.setState({bound: true})
        } else{
            this.setState({bound: false})
        }
    }

    handleScrollWrapper = (event) => {
        event.persist()
        this.delayedCallback(event)
    }


    handleClick = (e) => {
        this.sendMessage()
    }

    addEmoji = e => {
        let emoji = e.native;
        this.setState({
            value: this.state.value + emoji
        })
    }

    showEmojis = (e) => {
        this.setState({showEmojis: !this.state.showEmojis})
    }

    handleOutsideClick = (e) => {
        try {
            let node = ReactDOM.findDOMNode(this.emojiPicker.current)
            if (!node.contains(e.target)){
                this.setState({showEmojis: false})
            }   
        } catch(error){
            return null
        }
    }

    scrollToBottom = () => {    
        this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    determineOtherUser = () => {
        const user = this.props.user

        for (var key in this.props.room.members){
            if (key !== user.id.toString()){
                return this.props.room.members[key].id
            }
        }
    }
 
    render () {
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
                    <div className="chat-messages">
                        {this.props.activeChatMembers && this.props.messages && this.props.messages.map((msg) => 
                            <ChatMessageComponent key={msg.id} user={this.props.user} message={msg} members={this.props.activeChatMembers}/>
                        )}
                        <div ref={this.messagesEndRef} />
                    </div>
                </div>
                {this.props.activeChatMembers ? 
                    <div ref={(el) => { this.messagesEnd = el; }} className="chat-input-wrapper">
                        <form className="chat-input-form">
                            <input className="chat-input"
                                type="text"
                                onChange={this.handleChange} 
                                onKeyPress={this.handleSubmit}
                                value={this.state.value} 
                                placeholder="Type a message here...">
                            </input>
                        </form>
                        {this.state.showEmojis ?
                            <>
                                <div className="emoji-picker-icon" onClick={this.showEmojis}>
                                {String.fromCodePoint(0x1F62D)}
                                </div>
                                <div className="emoji-picker elevate">
                                    <Picker ref={this.emojiPicker} title='Pick your emoji…' emoji='point_up' sheetSize={32} emojiSize={22} onSelect={this.addEmoji}/>
                                </div>
                            </>:
                            <div className="emoji-picker-icon" onClick={this.showEmojis}>
                                {String.fromCodePoint(0x1f60a)}
                            </div>
                        } 
                        <div>
                            <Button onClick={() => this.handleClick()} 
                                style={{borderRadius: 15, fontSize: 10, fontFamily: "Lato", 
                                fontWeight: "700", backgroundColor: "#FFD460"}}
                            >
                                Send
                            </Button>
                        </div>
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
    getMoreMessages: PropTypes.func
}

function mapStateToProps(state){
    if (state.chat.activeRoom in state.chat.rooms){
        return {
            activeChatMembers: state.chat.rooms[state.chat.activeRoom].members,
            user: state.user.user,
            room: state.chat.rooms[state.chat.activeRoom]
        }
    } else {
        return {
            activeChatMembers: null,
            user: state.user.user,
        }
    }
    
}

const mapDispatchToProps = {
    removeNotifs,
    getMoreMessages
}


export default connect(mapStateToProps, mapDispatchToProps)(ChatWindowComponent)
export {ChatWindowComponent as UnderlyingChatWindowComponent}