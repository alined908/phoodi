import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { Button } from '@material-ui/core'
import styles from '../../styles/chat.module.css'

class ChatInput extends Component {
    constructor(props){
        super(props)
        this.state = {
            textValue: "",
            showEmojis: false
        }
        this.emojiPicker = React.createRef();
        this.showEmojis = this.showEmojis.bind(this);
    }
    
    // Add event listener for emoji picker outside click. 
    componentDidMount(){
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    // Remove event listener for emoji picker outside click. 
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }

    // Send message if send button is clicked. 
    handleClick = (e) => {
        this.sendMessage();
    }

    // Send message if enter button is touched. 
    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            this.sendMessage();
        }
    }

    // Change text input value. 
    handleChange = (e) => {
        this.setState({textValue: e.target.value});    
    }

    // Send message to chat room websocket and reset chat input value. 
    sendMessage = () => {
        const messageObject = {
            from: this.props.user.id, 
            text: this.state.textValue, 
            room: this.props.room.uri
        };
        this.setState({textValue: ""}, 
            () => this.props.socket.newChatMessage(messageObject)
        );
    }

    // Add emoji to text input.
    addEmoji = e => {
        let emoji = e.native;
        this.setState({
            textValue: this.state.textValue + emoji
        });
    }

    // Toggle emoji picker visibility.
    showEmojis = () => {
        this.setState({showEmojis: !this.state.showEmojis})
    }

    // Handle emoji picker outside click.
    handleOutsideClick = (e) => {
        try {
            let node = ReactDOM.findDOMNode(this.emojiPicker.current)
            if (!node.contains(e.target)) {
                this.setState({showEmojis: false})
            }   
        } catch(error){
            return null
        }
    }

    render(){
        return (
            <>
                <form className={styles.inputForm}>
                    <input className={styles.input}
                        type="text"
                        onChange={this.handleChange} 
                        onKeyPress={this.handleSubmit}
                        value={this.state.textValue} 
                        placeholder="Type a message..">
                    </input>
                </form>
                {this.state.showEmojis ?
                    <div className={styles.emojiPickerWrapper}>
                        <div className={styles.emojiIcon} onClick={this.showEmojis}>
                            {String.fromCodePoint(0x1F62D)}
                        </div>
                        <div className={`${styles.emojiPicker} elevate`}>
                            <Picker 
                                ref={this.emojiPicker} 
                                title='Pick your emoji…' 
                                emoji='point_up' 
                                sheetSize={20} 
                                emojiSize={20} 
                                onSelect={this.addEmoji}
                            />
                        </div>
                    </div>:
                    <div className={styles.emojiIcon} onClick={this.showEmojis}>
                        {String.fromCodePoint(0x1f60a)}
                    </div>
                } 
                <div>
                    <Button 
                        disabled={this.state.textValue.length === 0}
                        onClick={() => this.handleClick()} 
                        className={styles.sendButton}
                    >
                        Send
                    </Button>
                </div>
            </>
        )
    }
}

export default ChatInput