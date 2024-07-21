import React, { createElement, useState, useRef } from 'react';

import { NavLink, withRouter } from 'react-router-dom';
import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Comment, Tooltip, Input, Upload, Dropdown, Spin, Collapse, Affix } from 'antd';
import { SmileOutlined, SmileTwoTone, PlusOutlined, LoadingOutlined, SearchOutlined, EnterOutlined, RightOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';

import moment from 'moment';
import Message from '../components/Message.js';
import PinnedMessage from '../components/PinnedMessage.js';
import WebSocketInstance from "~/websocket";
import { connect } from "react-redux";
import NewChatMainContentBottom from "~/pages/new-chat/layouts/MainContentBottom";
import NewChatMainContentHeader from "~/pages/new-chat/layouts/MainContentHeader";
import axios from "axios";
import UserInfoModal from "~/pages/new-chat/modals/UserInfo";

const { Header, Content, Footer } = Layout;
const { Text, Title, Link, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
import '~/styles/css/MainContent.css';
import ChosenMessageMainContentBottom from "~/pages/new-chat/layouts/ChosenMessageMainContentBottom";


class MainContent extends React.Component {
    baseState = {
        messages: null,
        fetch_newer_messages: true,
        fetch_older_messages: true,
        loading: null,
        scroll: 0,
        show_scroll_down: false,
        user_info_modal_visibility: false,
        user_profile_shown: null,
        chosen_message: null,
        reply_to: null,
        images_loaded: false,
    }

    constructor(props) {
        super(props);
        this.state = this.baseState;
        this.messageContainerRef = React.createRef();
        this._isMounted = false;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        if (!nextProps.channel_object || nextProps.channel_object.id !== nextProps.channel)
            return false;
        if (nextProps.chat_object && nextProps.chat_object.id !== nextProps.chat)
            return false;

        return true;
    }

    render() {

        let rendered_messages = [];

        if (this.state.messages && this.props.chat_object) {
            if (this.state.loading === 'older') {
                rendered_messages.push(
                    <div key={"loading-indicator"} className={'loading-indicator'}>
                        <Spin indicator={antIcon} />
                    </div>
                );
            }
            if (!this.props.chat_object.last_read_message && this.state.messages.length) {
                rendered_messages.push(
                    <div key="new-messages-indicator" className={"new-messages-indicator"}>
                        <Text> New messages </Text>
                    </div>
                );
            }
            for (let i = 0; i < this.state.messages.length; i++) {
                let message = this.state.messages[i];
                rendered_messages.push(<Message onClick={() => {this.setState((state) =>({chosen_message: (!state.chosen_message || state.chosen_message.id !== message.id) ? message : null}))}}
                                                onClickReplyTo={() => this.scrollToMessage(message.reply_to.id)}
                                                chosen_message={this.state.chosen_message}
                                                id={message.id}
                                                key={message.id}
                                                message={message}
                                                onLoad={this.handleImageLoaded}
                                                username={this.props.username}
                                                max_last_read_message={this.props.chat_object.max_last_read_message}
                                                open_user={(username) => {
                                                    this.setState({
                                                        user_info_modal_visibility: true,
                                                        user_profile_shown: username,
                                                    })
                                                }} />);
                if(this.props.chat_object.last_read_message === message.id) {
                    if(i !== this.state.messages.length - 1) {
                        rendered_messages.push(
                            <div key="new-messages-indicator" className={"new-messages-indicator"}>
                                <Text> New messages </Text>
                            </div>
                        );
                    }
                }

            }
            if (this.state.loading === 'newer') {
                rendered_messages.push(
                    <div key={"loading-indicator"} className={'loading-indicator'}>
                        <Spin indicator={antIcon} />
                    </div>
                );
            }
        }

        let modals = [
            (
                <UserInfoModal
                    key={2}
                    token = {this.props.token}
                    chat={this.props.chat}
                    user={this.state.user_profile_shown}
                    username={this.props.username}
                    isVisible={this.state.user_info_modal_visibility}
                    close={() => this.setState({ user_info_modal_visibility: false, user_profile_shown: null, })}
                />
            ),
        ];
        return (
            <>
                {modals}
                <Layout className={"chat-layout-main"}>
                    <NewChatMainContentHeader
                        channel_object={this.props.channel_object}
                        chat={this.props.chat}
                        chat_object={this.props.chat_object}
                        channel = {this.props.channel}
                    />

                    <Content className={"content"}>
                        {
                            (this.props.chat)
                                ?
                                <div className="background">
                                    {
                                        (this.props.chat_object !== null && Object.entries(this.props.chat_object.pinned_message).length)
                                            ?
                                            <div className={'pinned-message-container'} onClick={() => this.scrollToMessage(this.props.chat_object.pinned_message.id)}>
                                                <div className={'vertical-bar'}/>
                                                <div className={'text-block'}>
                                                    <Space direction={'vertical'} size={2}>
                                                        <Text> Pinned Message </Text>
                                                        <Text className={'message-preview'} ellipsis={true}> {this.props.chat_object.pinned_message.content} </Text>
                                                    </Space>
                                                </div>
                                                <div className={'remove'}>
                                                    <Button
                                                        style={{fontSize: 10}}
                                                        ghost
                                                        shape={'circle'}
                                                        icon={<CloseOutlined style={{fontSize: 10}}/>}
                                                        onClick={this.removePinnedMessage}
                                                    />
                                                </div>
                                            </div>
                                            :
                                            null
                                    }
                                    <div ref={this.messageContainerRef} className="messages-container" onScroll={this.handleMessageScrolling}>
                                        {
                                            this.state.messages === null || this.state.loading === 'between'
                                                ?
                                                <Spin indicator={antIcon} />
                                                :
                                                rendered_messages.length
                                                    ?
                                                    <>
                                                        {rendered_messages}
                                                        {
                                                            this.state.show_scroll_down &&
                                                            <div style={{ position: 'absolute', bottom: 80, right: 30, alignSelf: 'flex-end' }}>
                                                                <Button size={'large'} shape={'circle'} icon={<DownOutlined />}
                                                                    onClick={this.jumpToNewestMessages}
                                                                />
                                                            </div>
                                                        }
                                                    </>
                                                    :
                                                    <Text className={'write-your-first-message'}> Write your first message! </Text>
                                        }
                                    </div>
                                    {
                                        this.state.chosen_message
                                            ?
                                            <ChosenMessageMainContentBottom
                                                chat={this.props.chat}
                                                chosen_message={this.state.chosen_message}
                                                pinned_message={this.props.chat_object.pinned_message}
                                                onClickCancel={() => this.setState({chosen_message: null})}
                                                onClickReply={() => this.setState((state) => ({reply_to: state.chosen_message, chosen_message: null}))}
                                            />
                                            :
                                            <NewChatMainContentBottom
                                                chat={this.props.chat}
                                                // channel={this.props.channel}
                                                reply_to={this.state.reply_to}
                                                remove_reply_to={() => this.setState({reply_to: null})}
                                                onClickReplyTo={
                                                    () => {
                                                        if(this.state.reply_to)
                                                            this.scrollToMessage(this.state.reply_to.id);
                                                    }
                                                }/>

                                    }
                                </div>
                                :
                                <div className={"background"}>
                                    <Text className={"empty-window"}> Choose a chat </Text>
                                </div>
                        }
                    </Content>
                </Layout>
            </>
        );
    }

    componentDidMount() {
        this._isMounted = true;
        // TODO: consider changing this
        WebSocketInstance.addCallbacks(
            {
                'new_message': this.receiveNewMessage,
                'fetch_messages': this.receiveFetchMessages,
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let target = this.messageContainerRef.current;
        if (this.props.chat !== prevProps.chat || (!prevProps.chat_object && this.props.chat_object)) {
            if(this.props.chat && this.props.chat_object)
                this.fetchMessages(this.props.chat, this.props.chat_object.last_read_message, 'between');
            this.setState(this.baseState);
            return;
        }
        if(!this.props.chat || !this.props.chat_object)
            return;
        if (this.state.scroll && this.state.messages) {
            let index = this.getMessageHTMLListIndex(this.state.scroll);
            if (index !== -1) {
                target.scrollTop = target.children[index].offsetTop - target.offsetTop;
                this.check_locked_and_loaded();
            }
        }

        if (this.props.chat_object.last_read_message === this.props.chat_object.last_message.id) {
            let msgs = this.state.messages;
            if(msgs && msgs.length && msgs[msgs.length - 1].id === this.props.chat_object.last_message.id && this.state.fetch_newer_messages)
                this.setState({ fetch_newer_messages: false});
        } else if(this.props.chat_object.last_message.id) {
            WebSocketInstance.waitForSocketConnection(this, (component) => {
                console.assert(this === component);
                WebSocketInstance.sendMessage({
                    command: 'update_last_read_messages',
                    username: component.props.username,
                    chat_id: component.props.chat,
                    last_read_message: this.props.chat_object.last_message.id
                });
            });
        }
    }

    componentWillUnmount() {
        // TODO: consider changing this
        WebSocketInstance.removeCallbacks(
            {
                'new_message': this.receiveNewMessage,
                'fetch_messages': this.receiveFetchMessages,
            }
        );
        this._isMounted = false;
    }

    removePinnedMessage = (e) => {
        e.stopPropagation();
        WebSocketInstance.waitForSocketConnection(this, (component) => {
            WebSocketInstance.sendMessage(
                {
                    command: 'update_pinned_message',
                    username: component.props.username,
                    chat_id: component.props.chat,
                    message_id: 0,
                }
            );
        });
    }

    scrollToMessage = (message_id) => {
        let msgs = this.state.messages;
        // let pinned_msg = this.props.chat_object.pinned_message;
        if (msgs && msgs.length && msgs[0].id <= message_id && message_id <= msgs[msgs.length - 1].id) {
            this.setState({scroll: message_id});
        } else {
            this.fetchMessages(this.props.chat, message_id, 'between');
        }
    }

    smoothChangeBackColor = (msg_id) => {
        let target = this.messageContainerRef.current;
        let index = this.getMessageHTMLListIndex(msg_id);
        if (index !== -1) {
            target.children[index].style.backgroundColor = 'greenyellow';
            setTimeout(() => {
                if(target.children[index])
                    target.children[index].style.backgroundColor = '';
            }, 1000);
        }
    }

    jumpToNewestMessages = () => {
        if (this.props.chat_object.last_message) {
            if (this.state.fetch_newer_messages)
                this.fetchMessages(this.props.chat, this.props.chat_object.last_message.id, 'between');
            else
                this.setState({scroll: this.props.chat_object.last_message.id});
        }
    }

    getMessageHTMLListIndex = (messageID) => {
        let target = this.messageContainerRef.current;
        for (let i = 0; i < target.children.length; i++)
            if (parseInt(target.children[i].id) === messageID)
                return i;
        return -1;
    }

    handleMessageScrolling = (e) => {

        if (!this.state.messages || !this.state.messages.length || this.state.loading)
            return;
        if (!this.state.fetch_newer_messages && e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 1000) {
            if(this.state.show_scroll_down) this.setState({ show_scroll_down: false });
        } else if(!this.state.show_scroll_down) {
            this.setState({ show_scroll_down: true });
        }
        if (Math.ceil(e.target.scrollHeight - e.target.scrollTop) - Math.ceil(e.target.clientHeight) <= 1) {
            let sz = this.state.messages.length;
            this.fetchMessages(this.props.chat, this.state.messages[sz - 1].id, 'newer');
        }
        if (e.target.scrollTop === 0)
            this.fetchMessages(this.props.chat, this.state.messages[0].id, 'older');
    }

    handleImageLoaded = (e) => {
        if (this.state.scroll) {
            let target = this.messageContainerRef.current;
            let index = this.getMessageHTMLListIndex(this.state.scroll);
            if (index !== -1) {
                target.scrollTop = target.children[index].offsetTop - target.offsetTop;
                this.setState({scroll: 0, images_loaded: true});
            }
        }
    }

    check_locked_and_loaded = () => {
        let locked_and_loaded = true;
        if(this.state.images_loaded) {
            this.setState({scroll: 0});
            return;
        }
        for (let i = 0; i < this.state.messages.length; i ++) {
            let message = this.state.messages[i];
            if (message.content_type === 'i') {
                locked_and_loaded = false;
                break;
            }
        }
        if(locked_and_loaded)
            this.setState({scroll: 0});
    }

    receiveNewMessage = (parsed_data) => {
        if (parsed_data.chat_id === this.props.chat) {
            let target = this.messageContainerRef.current;
            let scroll = 0;
            if (!this.state.fetch_newer_messages) {
                let data = {};
                // if we are at bottom, we stay there
                if (Math.ceil(target.scrollHeight - target.scrollTop) - Math.ceil(target.clientHeight) <= 1)
                    scroll = parsed_data.content.id
                // if we sent the message, we scroll to bottom
                if (parsed_data.content.contact.username === this.props.username)
                    scroll = parsed_data.content.id
                this.setState((state) => ({ messages: [...state.messages, parsed_data.content] }));

                if (scroll) data.scroll = scroll;
                if (parsed_data.content.content_type === 'i') data.images_loaded = false;
                this.setState(data);
            } else if (parsed_data.content.contact.username === this.props.username) {
                this.fetchMessages(this.props.chat, parsed_data.content.id, 'between');
            }
        }
    }

    fetchMessages = (chat_id, message_id, type) => {
        if (type !== 'between' && !this.state[`fetch_${type}_messages`]) {
            return;
        }
        this.setState({loading: type});
        WebSocketInstance.waitForSocketConnection(this, (component) => {
            console.assert(this === component);
            WebSocketInstance.sendMessage({
                command: 'fetch_messages',
                chat_id: chat_id,
                message_id: message_id,
                type: type,
            });
        });
    }

    receiveFetchMessages = (parsed_data) => {
        if (parsed_data.chat_id !== this.props.chat)
            return;
        this.setState({loading: null}, () => {
            if(parsed_data.type === 'older') {
                if(parsed_data.content.length !== parsed_data.block_size) {
                    this.setState((state) => ({
                        scroll: (parsed_data.content.length) ? state.messages[0].id : 0,
                        fetch_older_messages: false,
                        messages: [...parsed_data.content, ...state.messages]
                    }));
                } else {
                    this.setState((state) => ({
                        scroll: state.messages[0].id,
                        messages: [...parsed_data.content, ...state.messages]
                    }));
                }
            } else if(parsed_data.type === 'between') {
                let fetch_newer_messages = false, fetch_older_messages = false;
                let msgs = parsed_data.content, sz = parsed_data.content.length;
                console.log('parsed_data block_size: ', parsed_data.block_size, ' type: ', typeof parsed_data.block_size);
                console.log('parsed_data content: ', msgs);
                console.log('parsed_data message_id: ', parsed_data.message_id);
                if(sz >= parsed_data.block_size) {
                    if(sz > parsed_data.block_size && msgs[sz - parsed_data.block_size - 1].id === parsed_data.message_id)
                        fetch_newer_messages = true;
                    if(msgs[parsed_data.block_size - 1].id === parsed_data.message_id)
                        fetch_older_messages = true;
                }
                if(!parsed_data.message_id)
                    fetch_newer_messages = true;
                this.setState({
                    messages: parsed_data.content,
                    scroll: parsed_data.message_id,
                    images_loaded: (parsed_data.content.content_type === 'i'),
                    fetch_older_messages: fetch_older_messages,
                    fetch_newer_messages: fetch_newer_messages,
                });
            } else if(parsed_data.type === 'newer' && this.state.fetch_newer_messages) {
                if(parsed_data.content.length !== parsed_data.block_size) {
                    // console.log('fetched less');
                    this.setState((state) => ({
                        messages: [...state.messages, ...parsed_data.content],
                        fetch_newer_messages: false
                    }));
                } else {
                    this.setState((state) => ({
                        messages: [...state.messages, ...parsed_data.content],
                    }) );
                }
            }
        });
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainContent));
