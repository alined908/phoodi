class WebSocketService{
    static instance = null; 
    callbacks = {};
    
    static getInstance(){
        if (!WebSocketService.instance){
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor(){
        this.socketRef = null;
    }

    connect(uri){
        var ws_scheme = window.location.protocol == "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/chat/${uri}/`;
        this.socketRef = new WebSocket(path);
        
        this.socketRef.onmessage = e => {
            this.socketNewMessage(e.data);
          };

        this.socketRef.onopen = () => {
            console.log("WebSocket open");
        };
        
        this.socketRef.onerror = e => {
            console.log(e.message);
        };

        this.socketRef.onclose = () => {
            console.log("WebSocket closed, restarting..");
            this.connect(uri);
        };   
    }

    socketNewMessage(data){
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        if(Object.keys(this.callbacks).length === 0){
            return;
        }
        if(command === 'messages'){
            this.callbacks[command](parsedData.messages);
        }
        if(command === 'new_message'){
            console.log("okay so this was called")
            console.log(parsedData)
            console.log(command)
            console.log(this.callbacks)
            this.callbacks[command](parsedData.message);
        }
    }

    initChatUser(email){
        console.log("Websocket.js - initChatUser")
        this.sendMessage({command : 'init_chat', email: email});
    }

    fetchMessages(email){
        console.log("Websocket.js - fetchMessages")
        this.sendMessage({command : 'fetch_messages', email: email});
    }

    newChatMessage(message){
        console.log("Websocket.js - newChatMessage")
        this.sendMessage({command : 'new_message', from : message.from, text : message.text, room: message.room});
    }

    addCallbacks(messagesCallback, newMessageCallback){
        this.callbacks['messages'] = messagesCallback;
        this.callbacks['new_message'] = newMessageCallback;
    }

    sendMessage(data){
        try{
            console.log({...data})
            this.socketRef.send(JSON.stringify({...data}))
        }
        catch(err){
            console.log(err.message);
        }
    }
    state(){
        return this.socketRef.readyState;
    }
    waitForSocketConnection(callback){
        const socket = this.socketRef;
        const recursion = this.waitForSocketConnection;
        setTimeout(
            function(){
                if(socket.readyState === 1){
                    console.log("Connection is made");
                    if(callback != null){
                        callback();
                    }
                    return;
                }
                else{
                    console.log("Wait for connection..");
                    recursion(callback);
                }
            }, 1);
    }
}

let WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;