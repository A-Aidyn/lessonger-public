import {ws_host} from "~/helpers/Consts";

class WebSocketService {

    static instance = null; // static methods are called on the class itself (not on instances of the class). Utility function to create or clone objects
    callbacks = {}; // TODO: add callbacks to it when we initiate the service (fetch_messages, new_message commands)

    static getInstance() {
        if(!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    // Similar to __init__ in python
    constructor() {
        this.socketRef = null;  // Property of the class
        this.turnedOn = false;
    }

    connect(chatURL) {
        const path = `${ws_host}/ws/chat/1/`; // Local host of the Django server
        this.socketRef = new WebSocket(path);

        this.socketRef.onopen = () => {
        };
        this.socketRef.onmessage = e => {
            // sending a message
            this.socketNewMessage(e.data);
        }
        this.socketRef.onerror = e => {
        }
        this.socketRef.onclose = () => {
            if(!this.turnedOn)
                this.connect(chatURL); // Custom reconnecting socket
        }
    }

    disconnect() {
        if(this.socketRef) {
            this.socketRef.close();
            this.turnedOn = false;
            this.socketRef = null;
        }
    }

    // Receiving a message from the server
    socketNewMessage(data) {
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        if (Object.keys(this.callbacks).length === 0) // getting all keys from this.callbacks
            return;
        if (command === 'authorize') {
            if(parsedData.content === true) {
                this.turnedOn = true;
            }
        } else if (command === 'error') {
        } else if (!this.callbacks.hasOwnProperty(command)) {
        } else {
            for (let i = 0; i < this.callbacks[command].length; i ++) {
                let callback = this.callbacks[command][i];
                callback(parsedData);
            }
        }
    }

    authorize(token) {
        this.sendMessage({
            command: 'authorize',
            token: token
        });
    }

    fetchMessages(chat_id, message_id, type) {
        this.sendMessage(
            {
                command: 'fetch_messages',
                chat_id: chat_id,
                message_id: message_id,
                type: type
            });
    }

    newChatMessage(message) {
        this.sendMessage(
            {
                command: 'new_message',
                username: message.username,
                chat_id: message.chat,
                content: message.content,
            });
    }

    addCallbacks(callbacks) { // function for adding callbacks manually
        for(let [key, value] of Object.entries(callbacks)) {
            if(this.callbacks.hasOwnProperty(key))
                this.callbacks[key].push(value);
            else
                this.callbacks[key] = [value];
        }
    }

    removeCallbacks(callbacks) {
        for(let [key, value] of Object.entries(callbacks)) {
            if(this.callbacks.hasOwnProperty(key)) {
                this.callbacks[key] = this.callbacks[key].filter(function (arr_value, index, arr) {
                    return (arr_value !== value);
                });
            }
        }
    }

    sendMessage(data, toBackend=true) {
        try {
            if(toBackend)
                this.socketRef.send(JSON.stringify({ ...data}));
            else
                this.socketNewMessage(JSON.stringify({ ...data}));
        } catch (err) {
        }
    }

    state() {
        return this.socketRef.readyState;
    }

    waitForSocketConnection = (component, callback) => {
        if(!component._isMounted)
            return;
        if (WebSocketInstance.state() === 1 && this.turnedOn) {
            if(callback != null)
                callback(component);
        } else {
            setTimeout(function () {
                WebSocketInstance.waitForSocketConnection(component, callback);
            }, 500);
        }

    }

    waitForSocketReadyState = (component, callback) => {
        if(!component._isMounted)
            return;
        if (WebSocketInstance.state() === 1) {
            if(callback != null)
                callback(component);
        } else {
            setTimeout(function () {
                WebSocketInstance.waitForSocketReadyState(component, callback);
            }, 500);
        }

    }


    /* ... For each component ...
    waitForSocketConnection = (callback) => {
        const component = this;
        setTimeout(
            function () {
                if(!component._isMounted)
                    return;
                if (WebSocketInstance.state() === 1) {
                    if(callback != null)
                        callback();
                } else {
                    component.waitForSocketConnection(callback);
                }
            }, 500);
    } */
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;