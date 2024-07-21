import React from 'react';
import Sidepanel from "./sidepanels/Sidepanel";
import WebSocketInstance from "~/websocket";
import {Redirect, useHistory, withRouter, useRouteMatch, Switch, Route, } from "react-router-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import '~/styles/css/Chat.css';
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";
import * as joinChatActions from "~/store/actions/joinChat";
import * as userProfileActions from "~/store/actions/userProfile";
import * as KLMSActions from "~/store/actions/KLMS";
import {connect} from "react-redux";
import AddChatModal from './modals/AddChat';
import JoinChatModal from './modals/JoinChat';
import UserProfileModal from './modals/UserProfile';
import KLMSModal from './modals/Klms';
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import Content from "~/pages/chat/components/Content";
// import 'antd/dist/antd.css';


const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class Chat extends React.Component {


    constructor(props) {
        super(props);
        this.state = {}
        this._isMounted = false;  // This is needed to keep away from memory leak
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render () {
        if(!this.props.isAuthenticated) {
            return <Redirect to="/"> </Redirect>
        }
        let match = this.props.match;
        if(this.state.chatID !== match.params.chatID) {

            if (this.state.chatID != null)
                WebSocketInstance.disconnect();
            if (match.params.chatID != null) {
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
                this.setState({chatID: match.params.chatID});
            }
        }

        return (
            <div id="frame">
                <AddChatModal
                    isVisible={this.props.showAddChatPopup}
                    close={() => this.props.closeAddChatPopup()}
                />

                <JoinChatModal
                    isVisible={this.props.showJoinChatPopup}
                    close={() => this.props.closeJoinChatPopup()}
                    chatId = {this.props.match.params.chatID}
                />

                <UserProfileModal
                    isVisible={this.props.showUserProfilePopup}
                    close={() => this.props.closeUserProfilePopup()}
                />
                <KLMSModal
                    isVisible={this.props.showKLMS}
                    close={() => this.props.closeKLMS()}
                />
                <Sidepanel {...this.props} />
                <Switch>
                    <Route path={`${match.path}/:chatID`}>
                        <Content/>
                    </Route>
                    <Route path={match.path}>
                        <h1> Choose your chat </h1>
                    </Route>
                </Switch>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Chat));

