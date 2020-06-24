import AuthenticationService from "./AuthenticationService";

export default class WebSocketService {
  callbacks = {};

  constructor() {
    this.socketRef = null;
    this.waitForSocketConnection = this.waitForSocketConnection.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
  }

  getCallbacks() {
    return this.callbacks;
  }

  connect(path, token) {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_PROD_BASE_URL
        : process.env.REACT_APP_DEV_BASE_URL;
    const urlWithToken = baseURL;
    var url = new URL(path, urlWithToken);
    url.protocol =
      url.protocol === "http:"
        ? url.protocol.replace("http", "ws")
        : url.protocol.replace("https", "wss");
    if (token === null) {
      return;
    }
    this.socketRef = new WebSocket(url.href + `?token=${token}`);

    this.socketRef.onmessage = (e) => {
      console.log("Step 2 - Channel sends message from backend");
      this.socketNewMessage(e.data);
    };

    this.socketRef.onopen = () => {
      console.log("WebSocket open");
    };

    this.socketRef.onerror = (e) => {
      console.log(e.message);
    };

    this.socketRef.onclose = (e) => {
      console.log(e);
      //Token not authenticated
      console.log(e.code)
      const access = AuthenticationService.retrieveToken();
      setTimeout(() => this.connect(path, access), 500);
    //   if (e.code === 4000) {
    //     console.log("this reached")
    //     const access = AuthenticationService.retrieveToken();
    //     setTimeout(() => this.connect(path, access), 3000);
    //   } else {
    //     console.log("that reached")
    //     setTimeout(() => this.connect(path, token), 3000);
    //   }
    };
  }

  disconnect() {
    console.log("disconnect called");
    if (this.socketRef) {
      this.socketRef.onclose = function () {};
      this.socketRef.close();
    }
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const command = parsedData.command;
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    console.log("Step 3 - " + command + " command");

    //Convert all ifs to this.callbacks[command](parsedData)
    if (command === "fetch_messages") {
      this.callbacks[command](parsedData.messages);
    } else if (command === "new_message") {
      this.callbacks[command](parsedData.message);
    } else {
      console.log(parsedData);
      this.callbacks[command](parsedData);
    }
  }

  sendMessage(data) {
    console.log("Step 1 - Send Message to Channel");
    try {
      console.log({ ...data });
      console.log(this.socketRef.readyState);
      console.log(this.socketRef.url);
      this.socketRef.send(JSON.stringify({ ...data }));
    } catch (err) {
      console.log(err.message);
    }
  }

  ref() {
      return this.socketRef
  }

  exists() {
    return this.socketRef !== null;
  }

  state() {
    return this.socketRef.readyState;
  }

  uri() {
    return this.socketRef.uri;
  }

  waitForSocketConnection(callback) {
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(function () {
      if (socket.readyState === 1) {
        console.log("Connection is made");
        if (callback != null) {
          callback();
        }
        return;
      } else {
        // console.log("Wait for connection..");
        recursion(callback);
      }
    }, 2000);
  }
  //Chat commands
  fetchMessages(uri) {
    console.log("Websocket - fetchMessages");
    this.sendMessage({ command: "fetch_messages", uri: uri });
  }

  newChatMessage(message) {
    console.log("Websocket - newChatMessage");
    this.sendMessage({
      command: "new_message",
      from: message.from,
      text: message.text,
      room: message.room,
    });
  }

  newMeetupEvent(data) {
    console.log("Websocket - newEvent");
    this.sendMessage({ command: "new_event", data: data });
  }

  reloadMeetupEvent(data) {
    console.log("Websocket - reloadEvent");
    this.sendMessage({ command: "reload_event", data: data });
  }

  decideMeetupEvent(data) {
    console.log("Websocket - decideEvent");
    this.sendMessage({ command: "decide_event", data: data });
  }

  deleteMeetupEvent(data) {
    console.log("Websocket - delete meetup event");
    this.sendMessage({ command: "delete_event", data: data });
  }

  redecideMeetupEvent(data) {
    console.log("Websocket - redecideEvent");
    this.sendMessage({ command: "redecide_event", data: data });
  }

  voteMeetupEvent(data) {
    console.log("Websocket - voteEvent");
    this.sendMessage({ command: "vote_event", data: data });
  }

  addEventOption(data) {
    console.log("Websocket - addMeetupEventOption");
    this.sendMessage({ command: "new_option", data: data });
  }

  deleteEventOption(data) {
    console.log("Websocket - deleteMeetupEventOption");
    this.sendMessage({ command: "delete_option", data: data });
  }

  //Invite Commands
  fetchInvites(user) {
    console.log("Websocket - fetchInvites");
    this.sendMessage({ command: "fetch_invites", user: user });
  }

  newInvite(user) {
    console.log("Websocket - newInvite");
    this.sendMessage({ command: "new_invite", user: user });
  }

  fetchNotifications(data) {
    console.log("Websocket - fetchNotifications");
    this.sendMessage({ command: "fetch_notifications", data: data });
  }

  readNotifications(user, type) {
    console.log("Websocket - readNotifications");
    this.sendMessage({ command: "read_notifs", user: user, type: type });
  }

  addChatCallbacks(messagesCallback, newMessageCallback) {
    this.callbacks["fetch_messages"] = messagesCallback;
    this.callbacks["new_message"] = newMessageCallback;
  }

  addContactsCallbacks(reloadCallback) {
    this.callbacks["update_room"] = reloadCallback;
  }

  addMeetupCallbacks(
    eventsCallback,
    newEventCallback,
    reloadEventCallback,
    voteEventCallback,
    decideEventCallback,
    deleteEventCallback,
    addMemberCallback,
    deleteMemberCallback,
    newOptionCallback,
    deleteOptionCallback
  ) {
    this.callbacks["fetch_events"] = eventsCallback;
    this.callbacks["new_event"] = newEventCallback;
    this.callbacks["reload_event"] = reloadEventCallback;
    this.callbacks["vote_event"] = voteEventCallback;
    this.callbacks["decide_event"] = decideEventCallback;
    this.callbacks["redecide_event"] = decideEventCallback;
    this.callbacks["delete_event"] = deleteEventCallback;
    this.callbacks["new_member"] = addMemberCallback;
    this.callbacks["delete_member"] = deleteMemberCallback;
    this.callbacks["new_option"] = newOptionCallback;
    this.callbacks["delete_option"] = deleteOptionCallback;
  }

  addNotifCallbacks(addNotifCallback) {
    this.callbacks['create_notif'] = addNotifCallback
  }
}
