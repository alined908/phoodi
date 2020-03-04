export default class WebSocketService {
    callbacks = {};

    constructor(){
        this.socketRef = null;
        this.waitForSocketConnection = this.waitForSocketConnection.bind(this)
        this.disconnect = this.disconnect.bind(this)
        this.connect = this.connect.bind(this)
    }

    getCallbacks(){
        return this.callbacks;
    }

    connect(path){
        this.socketRef = new WebSocket(path);
        
        this.socketRef.onmessage = e => {
            console.log("Step 2 - Channel sends message from backend")
            this.socketNewMessage(e.data);
          };

        this.socketRef.onopen = () => {
            console.log("WebSocket open");
        };
        
        this.socketRef.onerror = e => {
            console.log(e.message);
        };

        this.socketRef.onclose = (e) => {
            console.log(e)
            setTimeout(() => this.connect(path), 5000);
        };
    }

    disconnect() {
        console.log("disconnect called")
        if (this.socketRef){
            this.socketRef.onclose = function(){}
            this.socketRef.close()
        }
    }

    socketNewMessage(data){
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        if(Object.keys(this.callbacks).length === 0){
            return;
        }
        console.log("Step 3 - " + command + " command")

        //Convert all ifs to this.callbacks[command](parsedData)
        if(command === 'fetch_messages'){
            this.callbacks[command](parsedData.messages);
        }
        else if(command === 'new_message'){
            this.callbacks[command](parsedData.message);
        }
        else {
            console.log(parsedData)
            this.callbacks[command](parsedData)
        }
    }

    sendMessage(data){
        console.log("Step 1 - Send Message to Channel")
        try{
            console.log({...data})
            console.log(this.socketRef.readyState)
            console.log(this.socketRef.url)
            this.socketRef.send(JSON.stringify({...data}))
        }
        catch(err){
            console.log(err.message);
        }
    }

    exists() {
        return this.socketRef !== null
    }

    state(){
        return this.socketRef.readyState;
    }

    uri(){
        return this.socketRef.uri;
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
            }, 1000);
    }
    //Chat commands
    fetchMessages(uri){
        console.log("Websocket - fetchMessages")
        this.sendMessage({command : 'fetch_messages', uri: uri});
    }

    newChatMessage(message){
        console.log("Websocket - newChatMessage")
        this.sendMessage({command : 'new_message', from : message.from, text : message.text, room: message.room});
    }

    //Event commands
    fetchMeetupEvents(meetup){
        console.log("Websocket - fetchEvents")
        this.sendMessage({command: 'fetch_events', meetup:meetup})
    }

    newMeetupEvent(data){
        console.log("Websocket - newEvent")
        console.log(data)
        this.sendMessage({command: 'new_event', data: data})
    }

    reloadMeetupEvent(data){
        console.log("Websocket - reloadEvent")
        this.sendMessage({command: 'reload_event', data: data})
    }

    decideMeetupEvent(data) {
        console.log("Websocket - decideEvent")
        this.sendMessage({command: 'decide_event', data: data})
    }

    deleteMeetupEvent(data){
        console.log("Websocket - delete meetup event")
        this.sendMessage({command: 'delete_event', data:data})
    }

    redecideMeetupEvent(data){
        console.log("Websocket - redecideEvent")
        this.sendMessage({command: 'redecide_event', data:data})
    }

    voteMeetupEvent(data){
        console.log("Websocket - voteEvent")
        this.sendMessage({command: 'vote_event', data: data})
    }

    //Invite Commands
    fetchInvites(user){
        console.log("Websocket - fetchInvites")
        this.sendMessage({command: 'fetch_invites', user:user})
    }

    newInvite(user){
        console.log("Websocket - newInvite")
        this.sendMessage({command: 'new_invite', user:user})
    }

    fetchNotifications(data){
        console.log("Websocket - fetchNotifications")
        this.sendMessage({command: 'fetch_notifications', data : data})
    }

    readNotifications(user, type) {
        console.log("Websocket - readNotifications")
        this.sendMessage({command: 'read_notifs', user:user, type:type})
    }

    addChatCallbacks(messagesCallback, newMessageCallback){
        this.callbacks['fetch_messages'] = messagesCallback;
        this.callbacks['new_message'] = newMessageCallback;
    }

    addEventCallbacks(eventsCallback, newEventCallback, reloadEventCallback, voteEventCallback, decideEventCallback, deleteEventCallback){
        this.callbacks['fetch_events'] = eventsCallback
        this.callbacks['new_event'] = newEventCallback
        this.callbacks['reload_event'] = reloadEventCallback
        this.callbacks['vote_event'] = voteEventCallback
        this.callbacks['decide_event'] = decideEventCallback
        this.callbacks['redecide_event'] = decideEventCallback
        this.callbacks['delete_event'] = deleteEventCallback
    }

    addInviteCallbacks(invitesCallback, newInviteCallback){
        this.callbacks['fetch_invites'] = invitesCallback
        this.callbacks['new_invite'] = newInviteCallback
    }

    addNotifCallbacks(notifsCallback){
        this.callbacks['fetch_notifs'] = notifsCallback
    }
}