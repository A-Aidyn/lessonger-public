import React from 'react';
import WebSocketInstance from "~/websocket";
import {Redirect, useHistory, withRouter, useRouteMatch, Switch, Route, } from "react-router-dom";
import '~/styles/css/Chat.css';
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";
import * as joinChatActions from "~/store/actions/joinChat";
import * as userProfileActions from "~/store/actions/userProfile";
import * as KLMSActions from "~/store/actions/KLMS";
import {connect} from "react-redux";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";


const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class Content extends React.Component {

    initializeChat() {
        let match = this.props.match;
        this.waitForSocketConnection(() => {
            // WebSocketInstance.addCallbacks(
            //     this.props.openJoinChatPopup.bind(this),
            //     this.props.loadOldMessages.bind(this),
            //     this.props.setMessages.bind(this),
            //     this.props.addMessage.bind(this));
            WebSocketInstance.authorize(this.props.token);
            WebSocketInstance.fetchMessages(
                this.props.username,
                match.params.chatID,
                0);
        });
        WebSocketInstance.connect(match.params.chatID);
    }

    constructor(props) {
        super(props);
        this.state = {}
        this._isMounted = false;  // This is needed to keep away from memory leak
        if(this.props.match.params.chatID)
           this.initializeChat();
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if(this.props.match.params.chatID !== newProps.match.params.chatID) {
            if (this.props.match.params.chatID != null)
                WebSocketInstance.disconnect();
            if (newProps.match.params.chatID != null) {
                this.waitForSocketConnection(() => {
                    // WebSocketInstance.addCallbacks(
                    //     this.props.openJoinChatPopup.bind(this),
                    //     this.props.loadOldMessages.bind(this),
                    //     this.props.setMessages.bind(this),
                    //     this.props.addMessage.bind(this));
                    WebSocketInstance.authorize(this.props.token);
                    WebSocketInstance.fetchMessages(
                        this.props.username,
                        newProps.match.params.chatID,
                        0);
                });
                WebSocketInstance.connect(newProps.match.params.chatID);
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    waitForSocketConnection(callback) {
        const component = this;
        setTimeout(
            function () {
                if(!component._isMounted)
                    return;
                if (WebSocketInstance.state() === 1) {
                    if(callback != null) {
                        callback();
                    }
                    return;
                } else {
                    component.waitForSocketConnection(callback);
                }
            }, 100);
    }

    // addMessage(message) {
    //     this.setState({
    //         messages: [...this.state.messages, message] // ...x means spread operator of x to create clone of x
    //     });
    // }
    //
    // setMessages(messages) {
    //     this.setState({
    //         messages: messages.reverse()
    //     });
    // }

    onScroll = (e) => {
        if (e.target.scrollTop === 0) {
            if(this.props.moreMessages) {
                this.props.waitingForOldMessages();
                let match = this.props.match;
                WebSocketInstance.fetchMessages(
                    this.props.username,
                    match.params.chatID,
                    this.props.messages.length);
            }
        }
    }

    sendMessageHandler = e => {
        e.preventDefault(); // form doesn't reload the page
        let match = this.props.match;
        const messageObject = {
            from: this.props.username,
            content: this.state.message,
            chatID: match.params.chatID
        }
        WebSocketInstance.newChatMessage(messageObject);
        // Page didn't reload. We just removed the text in the input-box
        this.setState({
            message: ''
        });
    }

    // This function is called every single time when you type something. TODO: add someone is typing... indicator in chat
    messageChangeHandler = event => {
        this.setState({
            message: event.target.value
        });
    }

    renderTimestamp = timestamp => {
        let prefix = '';
        const timeDiff = Math.round((new Date().getTime() - new Date(timestamp)) / 60000);
        if(timeDiff < 60 && timeDiff > 1) { // less than 60 mins and more than 1 min
            prefix = `${timeDiff} minutes ago`;
        } else if(timeDiff < 24 * 60 && timeDiff > 60) { // less than 24 hours and more than 1 hour
            prefix = `${Math.round(timeDiff / 60)} hours ago`;
        } else if(timeDiff < 31 * 24 * 60 && timeDiff > 24 * 60) { // less than 31 days and more than 1 day
            prefix = `${Math.round(timeDiff / (60 * 24))} days ago`;
        } else {
            prefix = `${new Date(timestamp)}`;
        }
        return prefix;

    }

    renderMessages = (messages) => {
        const currentUser = this.props.username; // Temporary username that can be accepted on the server side. TODO: change it later when we'll have login/signup
        // For every message we are going to return a list item
        return messages.map(message => (
            <li key={message.id} className={message.author === currentUser ? 'sent' : 'replies'}>
                {message.author === currentUser ? null :
                    (
                        <>
                            <b onClick={() => this.props.fetchUserProfile(this.props.token, message.author)}> {message.author} </b>
                            <br />
                            <img src="http://emilcarlsson.se/assets/mikeross.png" onClick={() => this.props.fetchUserProfile(this.props.token, message.author)}/>
                        </>
                    )}
                <p>
                    {message.content}
                    <br />
                    <small>
                        {this.renderTimestamp(message.timestamp)}
                    </small>
                </p>
            </li>
        ));
    }

    render () {
        if(!this.props.isAuthenticated) {
            return <Redirect to="/"> </Redirect>
        }
        return (
           <div className="content">
                <div className="contact-profile">
                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                    <p>Harvey Specter</p>
                    <div className="social-media">
                        <i className="fa fa-facebook" aria-hidden="true"></i>
                        <i className="fa fa-twitter" aria-hidden="true"></i>
                        <i className="fa fa-instagram" aria-hidden="true"></i>
                    </div>
                </div>
                <div className="messages" onScroll={this.onScroll}>
                    {
                        this.props.waiting ? <Spin indicator={antIcon} /> : null
                    }
                    <ul id="chat-log">
                        {
                            this.props.messages && this.renderMessages(this.props.messages)
                        }
                    </ul>
                </div>
                <div className="input-box">
                    <form onSubmit={this.sendMessageHandler}>
                        <div className="wrap">
                            <input onChange={this.messageChangeHandler} value={this.state.message} id="chat-message-input" type="text" placeholder="Write your message..." />
                            <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                            <button id="chat-message-submit">
                                <i className="fa fa-paper-plane" aria-hidden="true"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        isAuthenticated: state.auth.token !== null,
        token: state.auth.token,
        showAddChatPopup: state.nav.showAddChatPopup,
        showJoinChatPopup: state.joinChat.showJoinChatPopup,
        messages: state.message.messages,
        moreMessages: state.message.moreMessages,
        waiting: state.message.waiting,
        showUserProfilePopup: state.userProfile.showUserProfilePopup,
        showKLMS: state.KLMS.showKLMS,
        targetUsername: state.userProfile.targetUsername,
        targetUserInfo: state.userProfile.targetUserInfo,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        closeAddChatPopup: () => dispatch(navActions.closeAddChatPopup()),
        addMessage: message => dispatch(messageActions.addMessage(message)),
        waitingForOldMessages: () => dispatch(messageActions.waitingForOldMessages()),
        loadOldMessages: messages => dispatch(messageActions.loadOldMessages(messages)),
        setMessages: messages => dispatch(messageActions.setMessages(messages)),
        openJoinChatPopup: () => dispatch(joinChatActions.openJoinChatPopup()),
        closeJoinChatPopup: () => dispatch(joinChatActions.closeJoinChatPopup()),
        fetchUserProfile: (token, targetUsername) => dispatch(userProfileActions.fetchUserProfile(token, targetUsername)),
        closeUserProfilePopup: () => dispatch(userProfileActions.closeUserProfilePopup()),
        closeKLMS: () => dispatch(KLMSActions.closeKLMS()),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Content));

