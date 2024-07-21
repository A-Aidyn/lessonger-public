import React, { createElement, useState, useRef } from 'react';

import {NavLink, withRouter} from 'react-router-dom';
import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Comment, Tooltip, Input, Upload, Dropdown, Spin } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { SmileOutlined, SmileTwoTone, PlusOutlined, LoadingOutlined } from '@ant-design/icons';


import moment from 'moment';
import Message from '../components/Message.js';
import PinnedMessage from '../components/PinnedMessage.js';
import FileUpload from '../modals/FileUpload.js';
import WebSocketInstance from "~/websocket";
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";
import * as joinChatActions from "~/store/actions/joinChat";
import * as userProfileActions from "~/store/actions/userProfile";
import * as KLMSActions from "~/store/actions/KLMS";
import {connect} from "react-redux";
import ChatInfoModal from "~/pages/new-chat/modals/ChatInfo";
import NewChatMainContentBottom from "~/pages/new-chat/layouts/NewChatMainContentBottom";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


class NewChatMainContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initial_last_read_message: null,
            scroll: 0, // 0 - do not scroll, 1 - scroll to the indicated message, 2 - scroll to bottom, 3 - scroll to bottom if there are any pictures
            scroll_to_message: 0,
            atBottom: false,
            chat_info_modal_visibility: false,
            loading: 0, // 0 - not loading, 1 - loading older messages (up), 2 - loading newer messages (down)
        }
        this.messageContainerRef = React.createRef();
        this._isMounted = false;

        // TODO: handle scrolling events when user loads the chat with a direct URL
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let content = {scroll: 1};
        let old_sz = this.props.messages ? this.props.messages.length : 0,
            new_sz = nextProps.messages ? nextProps.messages.length : 0;

        if (!this.props.messages && nextProps.messages && nextProps.messages.length) {
            content.scroll_to_message = nextProps.last_read_message;
            if (nextProps.last_message.hasOwnProperty('id') && nextProps.last_message.id !== nextProps.last_read_message)
                content.initial_last_read_message = nextProps.last_read_message;
            this.setState(content);
            return false;
        }

        if (this.props.messages && nextProps.messages && old_sz && old_sz < new_sz) {
            if (this.props.messages[old_sz - 1].id === nextProps.messages[new_sz - 1].id) {
                content.scroll_to_message = nextProps.messages[new_sz - old_sz].id;
                content.loading = 0;
                this.setState(content);
                return false;
            }
            if (nextState.loading) {
                this.setState({loading: 0});
                return false;
            }
        }
        let noLoading = (nextState.loading === 1 && !nextProps.fetch_older_messages) ||
            (nextState.loading === 2 && !nextProps.fetch_newer_messages) ||
            (nextState.loading === 2 && nextProps.last_message.hasOwnProperty('id') && nextProps.last_message.id === nextProps.last_read_message);

        if(noLoading) {
            this.setState({loading: 0});
            return false;
        }

        if (this.state.scroll && this.state.scroll === nextState.scroll && this.state.scroll_to_message === nextState.scroll_to_message) {
            this.setState({scroll: 0, scroll_to_message: 0});
            return false;
        }

        return true;
    }

    render() {
        const users_typing = ['diyar', 'arsen', 'dada', 'adfas'];

        const menu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                        1st menu item
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                        2nd menu item
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                        3rd menu item
                    </a>
                </Menu.Item>
            </Menu>
        );

        let rendered_messages = [];

        if (this.state.loading === 1) {
            rendered_messages.push(
                <div key={"loading-indicator"} className={'loading-indicator'}>
                    <Spin indicator={antIcon}/>
                </div>
            );
        }

        if (this.state.initial_last_read_message === 0) {
            rendered_messages.push(
                <div key="new-messages-indicator"
                     className={"new-messages-indicator"}>
                    <Text> New messages </Text>
                </div>
            );
        }

        if(this.props.messages) {
            for (let i = 0; i < this.props.messages.length; i ++) {
                let message = this.props.messages[i];
                rendered_messages.push(<Message id={message.id} key={message.id} message={message} onLoad={this.handleImageLoaded}/>);
                if (message.id === this.state.initial_last_read_message && i !== this.props.messages.length - 1) {
                    rendered_messages.push(
                        <div key="new-messages-indicator" className={"new-messages-indicator"}>
                            <Text > New messages </Text>
                        </div>
                    );
                }
            }
        }

        if (this.state.loading === 2) {
            rendered_messages.push(
                <div key={"loading-indicator"} className={'loading-indicator'}>
                    <Spin indicator={antIcon}/>
                </div>
            );
        }

        let modals = [
            (
                <ChatInfoModal
                    key={1}
                    channel_is_course={this.props.channel_is_course}
                    chat={this.props.chat}
                    isVisible={this.state.chat_info_modal_visibility}
                    close={() => this.setState({chat_info_modal_visibility: false})}
                />
            ),
        ];

        return (
            <>
                { modals }
                <Layout className={"chat-layout-main"}>
                    <Header className="header">
                        <div className={"chat-name"}>
                            <Space direction={"vertical"} align={"center"} onClick={this.openChatInfo}>
                                {
                                    this.props.chat_object === null
                                    ?
                                        null
                                    :
                                        this.props.chat_object.is_private
                                        ?
                                            <Text> { this.props.chat_object.name } </Text>
                                        :
                                            <>
                                                <Text> { this.props.chat_object.name } </Text>
                                                <Text> { this.props.chat_object.participants_count } participants </Text>
                                            </>
                                }
                            </Space>
                        </div>
                        <Text className={"user-name-surname"}> Name Surname </Text>

                        <Dropdown overlay={menu} placement="topRight" trigger='click' >
                            <Button className={"user-profile-button"} type="primary"> </Button>
                        </Dropdown>
                    </Header>


                    <Content className={"content"}>
                        {
                            (this.props.chat !== null && this.props.messages !== null)
                                ?
                                    <div className="background">
                                        <div ref={this.messageContainerRef} className="messages-container" onScroll={this.handleMessageScrolling}>
                                            { rendered_messages.length ? rendered_messages : <Text className={'write-your-first-message'}> Write your first message! </Text> }
                                        </div>

                                        <NewChatMainContentBottom chat={this.props.chat} />
                                    </div>
                                :
                                    <div className={"background"}>
                                        <Text className={"empty-window"}> Choose a chat </Text>
                                    </div>
                        }

                    </Content>
                </Layout>
            </>


        )
    }

    componentDidMount() {
        this._isMounted = true;
        WebSocketInstance.waitForSocketConnection(this, (component) => {
            WebSocketInstance.addCallbacks(
                {
                    'new_message': component.receiveNewMessage,
                    'fetch_messages': component.fetchMessages,
                }
            );
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        let target = this.messageContainerRef.current;
        if (this.state.scroll === 1) {
            let index = this.getMessageHTMLListIndex(this.state.scroll_to_message);

            if (index === -1) target.scrollTop = 0;
            else              target.scrollTop = target.children[index].offsetTop - target.offsetTop;
            // this.setState({scroll: 0, scroll_to_message: 0});
            return;
        }

        // handling scroll position when old messages are fetched
        /* if (prevProps.messages && this.props.messages && prevProps.messages[0] !== this.props.messages[0] && prevProps.messages[prevProps.messages.length - 1] === this.props.messages[this.props.messages.length - 1]) {
            let old_message_index = this.props.messages.length - prevProps.messages.length;
            target.scrollTop = target.children[old_message_index - 1].offsetTop;
        } */

        // setting scroll position to new bottom when we were at bottom and there is a new message
        if (prevProps.messages && this.props.messages &&  (this.props.messages.length - 1) === prevProps.messages.length && !this.props.fetch_newer_messages) {
            if(this.state.atBottom || this.props.messages[this.props.messages.length - 1].contact.username === this.props.username)
                target.scrollTop = target.scrollHeight - target.clientHeight;
        }

        // handling scroll position when we have last_read_message prop [only when we change chat or when we first enter a chat]
        /* if (this.state.scroll === 1) {
            this.messageContainerRef.current.scrollTop = this.newMessagesIndicatorRef.current.offsetTop - 80;
            this.setState({ scroll: 0 });
        } else if(this.state.scroll === 2) {
            // if we don't have new messages text, then we just set scroll position to bottom
            target.scrollTop = target.scrollHeight - target.clientHeight;
            this.setState({scroll: 3});
        } */

    }

    componentWillMount() {
        this._isMounted = false;
    }

    handleMessageScrolling = (e) => {
        if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
            this.props.waitForSocketConnection(() => {
                if(this.props.fetch_newer_messages && this.props.messages && this.props.messages.length) {
                    let sz = this.props.messages.length;
                    WebSocketInstance.fetchMessages(this.props.chat, this.props.messages[sz - 1].id, 'newer');
                    this.setState({loading: 2});
                }
            });
        }

        if(e.target.scrollTop === 0) {
            this.props.waitForSocketConnection(() => {
                if (this.props.messages && this.props.messages.length) {
                    WebSocketInstance.fetchMessages(this.props.chat, this.props.messages[0].id, 'older');
                    this.setState({loading: 1});
                }
            });
        }
    }

    receiveNewMessage = (parsed_data) => {
        let shouldUpdateCount = !(parsed_data.chat_id === this.state.chat);
        if (parsed_data.chat_id === this.state.chat) {
            if(this.state.fetch_newer_messages) { // if we still have more messages to fetch
                if (parsed_data.content.contact.username === this.props.username) {
                    // If we wrote a message we have to fetch the latest messages and jump there
                    WebSocketInstance.waitForSocketConnection(this, (component) => {
                        WebSocketInstance.fetchMessages(parsed_data.chat_id, parsed_data.content.id, 'between');
                    });
                    // And update the last_read_message in backend and in frontend
                    this.setState({fetch_newer_messages: false});
                    this.updateLastReadMessageOfCurrentChat(parsed_data.content.id);
                }
            } else {
                this.updateLastReadMessageOfCurrentChat(parsed_data.content.id);
                this.setState((state, props) => ({
                    messages: [...state.messages, parsed_data.content]
                }));
            }
        }

        let chats = [...this.state.chats];
        for (let i = 0; i < chats.length; i ++) {
            if (chats[i].id === parsed_data.chat_id) {
                let chat = {...chats[i]};
                chat.last_message = parsed_data.content;
                if(shouldUpdateCount)
                    chat.unread_count ++;
                chats[i] = chat;
            }
        }

        this.setState((state, props) => ({
            chats: chats,
            events: [...state.events, parsed_data],
        }));
    }

    /*  ASYNC  */

    receiveFetchMessages = async (parsed_data) => {
        if (parsed_data.chat_id !== this.props.chat)
            return;
        let fetched_messages = [...parsed_data.content];
        let promises = [];
        let image_messages = [];
        for (let i = 0; i < fetched_messages.length; i ++) {
            let message = fetched_messages[i];
            if (message.content_type === 'i') {
                promises.push(
                    axios({
                        method: 'get',
                        url: message.file_url,
                        responseType: 'arraybuffer',
                    })
                );
                image_messages.push(message);
            }
        }
        const responses = await Promise.all(promises);
        for (let i = 0; i < image_messages.length; i ++) {
            let response = responses[i];
            image_messages[i].image = {
                data: `data:${response.headers['content-type']};base64,${_imageEncode(response.data)}`
            }
        }

        if(parsed_data.type === 'older') {
            this.setState((state) => ({messages: [...fetched_messages, ...state.messages]}) );
            if(!parsed_data.content.length)
                this.setState({fetch_older_messages: false});
        } else if(parsed_data.type === 'between') {
            this.setState({messages: fetched_messages} );
        } else if(parsed_data.type === 'newer' && this.state.fetch_newer_messages) {
            this.setState((state) => ({messages: [...state.messages, ...fetched_messages]}) );
            if(!parsed_data.content.length)
                this.setState({fetch_newer_messages: false});
        }
    }

    fetchMessages = (parsed_data) => {
        if (parsed_data.chat_id !== this.state.chat)
            return;
        if(parsed_data.type === 'older') {
            this.setState((state) => ({messages: [...parsed_data.content, ...state.messages]}) );
            if(!parsed_data.content.length)
                this.setState({fetch_older_messages: false});
        } else if(parsed_data.type === 'between') {
            this.setState({messages: parsed_data.content} );
        } else if(parsed_data.type === 'newer' && this.state.fetch_newer_messages) {
            if(this.state.messages && this.state.messages.length)
                this.updateLastReadMessageOfCurrentChat(this.state.messages[this.state.messages.length - 1].id);
            if(!parsed_data.content.length)
                this.setState({fetch_newer_messages: false});
            else
                this.setState((state) => ({messages: [...state.messages, ...parsed_data.content]}) );
        }
    }

    updateLastReadMessageOfCurrentChat = (new_message_id) => {
        // Updating the last read message of the current chat
        for (let i = 0; i < this.state.chats.length; i ++) {
            let chat = this.state.chats[i];
            if (chat.id === this.state.chat) {
                if (new_message_id > chat.last_read_message) {
                    let chats = [...this.state.chats];
                    chat = {...this.state.chats[i]};
                    chat.last_read_message = new_message_id;
                    chats[i] = chat;
                    this.setState({
                        chats: chats
                    });
                    WebSocketInstance.waitForSocketConnection(this, (component) => {
                        WebSocketInstance.sendMessage({
                            command: 'update_last_read_messages',
                            username: component.props.username,
                            chat_id: chat.id,
                            last_read_message: new_message_id
                        });
                    });
                    break;
                }
            }
        }
    }

    handleImageLoaded = (e) => {
        let target = this.messageContainerRef.current;
        if(target.children.length === this.props.messages.length + (this.state.initial_last_read_message !== null)) {

        }

        if (this.state.scroll === 1) {
            let index = this.getMessageHTMLListIndex(this.state.scroll_to_message);
            if(index !== -1)

            if (index === -1) target.scrollTop = 0;
            else              target.scrollTop = target.children[index].offsetTop - target.offsetTop;
            // this.setState({scroll: 0, scroll_to_message: 0});
            return;
        }

        // if(this.state.scroll === 3) {
        //     let target = this.messageContainerRef.current;
        //     target.scrollTop = target.scrollHeight - target.clientHeight;
        // }
    }

    openChatInfo = () => {
        if(this.props.chat_object.is_private) {
            // Open user profile
        } else {
            this.setState({chat_info_modal_visibility: true});
        }
    }

    getMessageHTMLListIndex = (messageID) => {
        let target = this.messageContainerRef.current;
        for (let i = 0; i < target.children.length; i ++)
            if(parseInt(target.children[i].id) === messageID)
                return i;
        return -1;
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.auth.token,
        username: state.auth.username
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewChatMainContent));
