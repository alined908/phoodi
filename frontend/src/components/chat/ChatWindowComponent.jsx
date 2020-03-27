import React, {Component} from 'react'
import {ChatMessageComponent} from "../components"
import {connect} from 'react-redux'
import {Button, Tooltip} from '@material-ui/core'
import {Link} from 'react-router-dom';
import {removeNotifs} from "../../actions/notifications"
import {getMoreMessages} from "../../actions/chat"
import {Person as PersonIcon, Event as EventIcon} from "@material-ui/icons"
import throttle from 'lodash/throttle'

class ChatWindowComponent extends Component {
    constructor(props){
        super(props);
        this.state = {
            value: "",
            bound: true
        }
    }
    componentDidUpdate() {
        if (this.state.bound){
            this.scrollToBottom();
        }
    }

    messagesEndRef = React.createRef()
    
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

    handleScroll = (e) => {
        console.log(e.target.scrollTop)
        if (e.target.scrollTop === 0 && this.props.messages.length > 49) {
            console.log('hello')
            this.props.getMoreMessages(this.props.room.uri, this.props.messages[0].id)
        }

        if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight){
            this.setState({bound: true})
        } else{
            this.setState({bound: false})
        }
    }


    handleClick = (e) => {
        this.sendMessage()
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
                <div className="chat-messages-wrapper" onScroll={this.handleScroll} ref={this.messagesRef}>
                    <div className="chat-messages">
                        {this.props.activeChatMembers && this.props.messages && this.props.messages.map((msg) => 
                            <ChatMessageComponent key={msg.id} user={this.props.user} message={msg} members={this.props.activeChatMembers}/>
                        )}
                        <div ref={this.messagesEndRef} />
                    </div>
                </div>
                {this.props.activeChatMembers ? 
                    <div ref={(el) => { this.messagesEnd = el; }} className="chat-input">
                        <form className="chat-input-form">
                            <input className="chat-input"
                                type="text"
                                onChange={this.handleChange} 
                                onKeyPress={this.handleSubmit}
                                value={this.state.value} 
                                placeholder="Type a message here...">
                            </input>
                        </form>
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