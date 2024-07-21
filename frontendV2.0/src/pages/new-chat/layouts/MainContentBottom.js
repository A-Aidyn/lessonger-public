import React, { createElement, useState, useRef } from 'react';

import {NavLink, withRouter} from 'react-router-dom';
import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Comment, Tooltip, Input, Upload, Dropdown, Spin, Popover } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { SmileOutlined, SmileTwoTone, PlusOutlined, LoadingOutlined } from '@ant-design/icons';


import moment from 'moment';
import Message from '../components/Message.js';
import PinnedMessage from '../components/PinnedMessage.js';
import FileUpload from '../modals/FileUpload.js';
import WebSocketInstance from "~/websocket";
import {connect} from "react-redux";
import ChatInfoModal from "~/pages/new-chat/modals/ChatInfo";
import AnimatedDots from "~/pages/new-chat/components/AnimatedDots";
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import data from 'emoji-mart/data/google.json';
import { NimblePicker } from 'emoji-mart';
import TextareaAutosize from 'react-textarea-autosize';
import Repliedto from "~/pages/new-chat/components/Repliedto";

const { Text, Title } = Typography;
const { TextArea } = Input;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

import emoji from 'react-easy-emoji';
import { EmojiButton } from '@joeattardi/emoji-button';

const display_users_typing = (users) => {
    if(users.length === 0) {
        return (
            <p> &nbsp; </p>
        );
    }
    if (users.length === 1) {
        return (
            <AnimatedDots> <Text style={{ 'fontSize': '12px', 'marginLeft': '4px' }}> {users[0]} is typing </Text> </AnimatedDots>
        );
    }
    if (users.length > 1) {
        let text = users[0];
        for (let i = 1; i < users.length; i++) {
            text += ', ' + users[i];
        }
        return (
            <AnimatedDots> <Text style={{ 'fontSize': '12px', 'marginLeft': '4px' }}> {text} are typing </Text> </AnimatedDots>
        );
    }
}

const svgEmoji = (input) => {
	return emoji(input, {
		baseUrl: 'https://twemoji.maxcdn.com/2/svg/',
		ext: '.svg',
		size: ''
	})
}

class MainContentBottom extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filePopUp: false,
            last_type_timestamp: null,
            users_typing: [],
            message: '',
            popover_visibility: false,
            autofocus: true,
        }
        this._isMounted = false;
        this.textareaRef = React.createRef();
        // this.picker = <NimblePicker set='google' data={data} title={'Pick your emoji...'} emoji='point_up' onSelect={this.onEmojiClick} />
        this.EmoPicker = new EmojiButton({position: {bottom: '55px', right: '10px'}, autoHide: false});
        this.EmoPicker.on('emoji', selection => {
            this.onEmojiClick(selection.emoji);
        })
        //console.log(this.EmoPicker, 'background: #222; color: #bada55');
        this.trigger = React.createRef();
    }

    render() {
        // const users_typing = ['diyar', 'arsen', 'dada', 'adfas'];
        // const users_typing = [];

        let modals = [
            (
                <FileUpload
                    key={1}
                    username={this.props.username}
                    chat={this.props.chat}
                    reply_to={this.props.reply_to}
                    handleClose={() => {
                        this.setState({ filePopUp: !this.state.filePopUp });
                        this.props.remove_reply_to();
                    }}
                    isModalVisible={this.state.filePopUp}
                    token={this.props.token}
                />
            ),
        ];



        return (
            <div className="bottom" >
                { modals }
                {
                    this.props.reply_to &&
                    <Repliedto
                        reply_to={this.props.reply_to}
                        removable={true}
                        remove={this.props.remove_reply_to}
                        onClickReplyTo={() => this.props.onClickReplyTo()}
                    />
                }
                { display_users_typing(this.state.users_typing) }
                <div className="message-input-field"  >
                    <PlusOutlined
                        className={"plus-outlined"}
                        onClick={() => this.setState({ filePopUp: !this.state.filePopUp })}
                    />
                    {/*<TextArea*/}
                    {/*    allowClear={true}*/}
                    {/*    className={"message-text-area"}*/}
                    {/*    size="large"*/}
                    {/*    placeholder="Start typing for reply..."*/}
                    {/*    onPressEnter={this.sendMessageHandler}*/}
                    {/*    onChange={this.typeMessageHandler}*/}
                    {/*    bordered={false}*/}
                    {/*    autoSize={true}*/}
                    {/*/>*/}
                    <TextareaAutosize
                        // minRows={2}
                        autoFocus={!!this.props.reply_to}
                        maxRows={10}
                        ref={this.textareaRef}
                        className={'message-text-area'}
                        onChange={this.typeMessageHandler}
                        onKeyPress={this.sendMessageHandler}
                        value={this.state.message}
                        placeholder={'Start typing for reply...'}
                    />
                    <div
                        ref={this.trigger} 
                        onClick={() => this.EmoPicker.togglePicker()}
                    >
                        <SmileTwoTone  className={"smile-two-tone"} />
                    </div>

                </div>
            </div>
        );
    }

    componentDidMount() {
        this._isMounted = true;
        WebSocketInstance.addCallbacks(
            {
                'user_typing': this.receiveUserTyping,
                'new_message': this.receiveNewMessage,
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.chat !== prevProps.chat) {
            this.textareaRef.current.focus();
            this.setState({
                filePopUp: false,
                last_type_timestamp: null,
                users_typing: [],
                message: '',
                popover_visibility: false,
                autofocus: true,
            });
        }
        // if (this.props.reply_to) this.textareaRef.current.focus();
    }

    componentWillUnmount() {
        this._isMounted = false;
        WebSocketInstance.removeCallbacks(
            {
                'user_typing': this.receiveUserTyping,
                'new_message': this.receiveNewMessage,
            }
        );
    }

    onEmojiClick = (emoji) => {
        let cursorPositionStart = this.textareaRef.current.selectionStart;
        let cursorPositionEnd = this.textareaRef.current.selectionEnd;
        const textareaStrParts = [
            `${this.state.message.substring(0, cursorPositionStart)}`,
            `${emoji}`,
            `${this.state.message.substring(cursorPositionEnd, this.state.message.length)}`,
        ];
        let textareaValue = textareaStrParts.join('');
        this.setState((state) => ({message: textareaValue}), () => {
            this.textareaRef.current.focus();
            this.textareaRef.current.setSelectionRange(cursorPositionStart + emoji.length, cursorPositionStart + emoji.length);
        });

    }

    sendMessageHandler = (e) => {
        if(e.key !== 'Enter')
            return;
        if(!e.shiftKey) {
            e.preventDefault();
            let msg = e.target.value;
            if (!msg.trim() || msg.length === 0)
                return;
            let data = {
                content: msg,
                content_type: 't',
                reply_to: this.props.reply_to && this.props.reply_to.id,
            };
            WebSocketInstance.waitForSocketConnection(this, (component) => {
                WebSocketInstance.sendMessage(
                    {
                        command: 'new_message',
                        username: component.props.username,
                        chat_id: component.props.chat,
                        // channel_id: component.props.channel,
                        data: data,
                    }
                );
            });
            // let tmp = document.getElementsByClassName("ant-input-clear-icon")[0];
            // tmp.click();
            this.setState({message: '', popover_visibility: false});
            this.props.remove_reply_to();
        }
    }

    typeMessageHandler = (e) => {
        let updated_state = {message: e.target.value};
        if(!this.state.last_type_timestamp || (Date.now() - this.state.last_type_timestamp) > 2000) {
            WebSocketInstance.waitForSocketConnection(this, (component) => {
                console.assert(this === component);
                WebSocketInstance.sendMessage({
                    command: 'user_typing',
                    username: component.props.username,
                    chat_id: component.props.chat,
                });
            });
            updated_state.last_type_timestamp = Date.now();
        }
        this.setState(updated_state);
    }

    userStoppedTyping = (username) => {
        let users_typing = [...this.state.users_typing];
        for(let i = 0; i < users_typing.length; i ++) {
            if(users_typing[i] === username) {
                let left = [];
                if (i) left = users_typing.slice(0, i - 1);
                this.setState({users_typing: [...left, ...users_typing.slice(i + 1, users_typing.length)]});
                break;
            }
        }
    }

    receiveUserTyping = (parsed_data) => {
        if(parsed_data.username !== this.props.username && parsed_data.chat_id === this.props.chat) {
            if(!this.state.users_typing.includes(parsed_data.username)) {
                this.setState((state) => ({users_typing: [...state.users_typing, parsed_data.username]}));
                setTimeout(() => this.userStoppedTyping(parsed_data.username), 4000);
            }
        }
    }

    receiveNewMessage = (parsed_data) => {
        if(parsed_data.chat_id === this.props.chat)
            this.userStoppedTyping(parsed_data.content.contact.username);
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainContentBottom));
