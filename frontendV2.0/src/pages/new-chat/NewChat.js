import React from 'react';
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import {connect} from "react-redux";
import { Layout, Typography} from 'antd';
import '~/styles/css/NewChat.css';
// import 'antd/dist/antd.css';
import NewChatIconSidepanel from "./layouts/IconSidepanel";
import NewChatNameSidepanel from "./layouts/NameSidepanel";
import NewChatMainLayout from "./layouts/MainContent";
import WebSocketInstance from "~/websocket";
import axios from "axios";
import {hostname} from "~/helpers/Consts";
import JoinChatModal from "~/pages/new-chat/modals/JoinChat";
import CrossIcon from "~/media/1485969927-6-cross_78905.svg";
import CheckForNotificationSettings from "~/pages/new-chat/layouts/CheckForNotificationSettings";

const {Footer} = Layout;
const {Text} = Typography;


class NewChat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: (typeof props.match.params.channel !== 'undefined') ? parseInt(props.match.params.channel) : 0,
            chat: (typeof props.match.params.chat !== 'undefined') ? parseInt(props.match.params.chat) : 0,
            uuid: (typeof props.match.params.uuid !== 'undefined') ? props.match.params.uuid : null,
            url_base_path: this.getBasePath(props),
            events: [],
            channel_object: null,
            chat_object: null
        };
        this._isMounted = false;
        axios.defaults.headers = { Authorization: `Token ${this.props.token}` };
        WebSocketInstance.connect('1');
    }

    render () {
        if (!this.props.isAuthenticated)
            return <Redirect to={'/'}/>

        let modals = [
            (
                <JoinChatModal
                    key={1}
                    isVisible={this.state.uuid !== null}
                    close={this.closeJoinChatModal}
                    uuid={this.state.uuid}
                    token={this.props.token}
                />
            ),
        ];
        return (
            <>
                { modals }
                <Layout>
                    <Layout>
                        <NewChatIconSidepanel
                            channel={this.state.channel}
                            change_channel={this.changeChannel}
                        />

                        <NewChatNameSidepanel
                            channel={this.state.channel}
                            channel_object={ this.state.channel_object }
                            chat={this.state.chat}
                            change_chat={this.changeChat}
                        />

                        <NewChatMainLayout
                            channel={this.state.channel}
                            channel_object={ this.state.channel_object }
                            chat={this.state.chat}
                            chat_object={ this.state.chat_object }
                        />
                    </Layout>
                    <CheckForNotificationSettings />
                </Layout>
            </>
        )
    }

    componentDidMount() {
        this._isMounted = true;
        console.log('New Chat DID MOUNT!!!');
        document.title = 'Chat | Lessonger';
        WebSocketInstance.waitForSocketReadyState(this, (component) => {
            WebSocketInstance.authorize(component.props.token);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.uuid && (typeof this.props.match.params.uuid === 'undefined'))
            this.setState({ uuid: null });
    }

    componentWillUnmount() {
        this._isMounted = false;
        WebSocketInstance.disconnect();
    }

    getBasePath = (props) => {
        let base_path = '/new-chat';
        if (typeof props.match.params.uuid !== 'undefined') {
            base_path = '/' + props.location.pathname.split('/')[1];
        } else {
            let params_len =
                (typeof props.match.params.channel !== 'undefined' && (props.match.params.channel.length + 1))
                + (typeof props.match.params.chat !== 'undefined' && (props.match.params.chat.length + 1))
                + (props.location.pathname.endsWith('/'));
            base_path = props.location.pathname.slice(0, -params_len);
            if(params_len === 0)
                base_path = props.location.pathname;
        }
        return base_path;
    }

    changeChannel = (channelId, channel_object) => {
        if(this.state.channel === channelId && this.state.channel_object === channel_object)
            return;
        if(this.state.channel !== channelId) {
            this.props.history.push(`${this.state.url_base_path}/${channelId}`);
            this.setState({ channel: channelId, channel_object: channel_object, chat: 0, chat_object: null } );
        } else {
            this.setState({channel_object: channel_object} );
        }
    }

    changeChat = (chatId, chat_object) => {
        if(this.state.chat === chatId && this.state.chat_object === chat_object)
            return;
        this.setState({ chat: chatId, chat_object: chat_object });
        if(this.state.chat !== chatId)
            this.props.history.push(`${this.state.url_base_path}/${this.state.channel}/${chatId}`);
    }

    closeJoinChatModal = () => {
        this.props.history.push(`${this.state.url_base_path}`);
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.token !== null,
        token: state.auth.token,
        username: state.auth.username,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewChat));