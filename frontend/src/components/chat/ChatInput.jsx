import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import 'emoji-mart/css/emoji-mart.css'
import {Picker} from 'emoji-mart'
import {Button} from '@material-ui/core'
import styles from '../../styles/chat.module.css'

class ChatInput extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: "",
            showEmojis: false
        }
        this.emojiPicker = React.createRef();
        this.showEmojis = this.showEmojis.bind(this)
    }
    
    //Add Event listener for emoji picker outside click
    componentDidMount(){
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    //If Component unmounts remove outsideclick event listener
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }

    //If Send button is clicked
    handleClick = (e) => {
        this.sendMessage()
    }

    //If enter button is hit
    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            this.sendMessage()
        }
    }

    // Handle Change in text input
    handleChange = (e) => {
        this.setState({value: e.target.value})       
    }

    //Send Message with websocket
    sendMessage = () => {
        if (this.state.value.length > 0 ){
            const messageObject = {from: this.props.user.id, text: this.state.value, room: this.props.room.uri}
            this.setState({value: ""}, () => this.props.socket.newChatMessage(messageObject))
        } 
    }

    //Add Emoji to Text Input
    addEmoji = e => {
        let emoji = e.native;
        this.setState({
            value: this.state.value + emoji
        })
    }

    //Show Emoji Picker
    showEmojis = (e) => {
        this.setState({showEmojis: !this.state.showEmojis})
    }

    //Handle Emoji Picker Outside Click
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

    render(){
        return (
            <>
                <form className={styles.inputForm}>
                    <input className={styles.input}
                        type="text"
                        onChange={this.handleChange} 
                        onKeyPress={this.handleSubmit}
                        value={this.state.value} 
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
                    <Button onClick={() => this.handleClick()} 
                        style={{borderRadius: 15, fontSize: 10, backgroundColor: "#FFD460"}}
                    >
                        Send
                    </Button>
                </div>
            </>
        )
    }
}

export default ChatInput