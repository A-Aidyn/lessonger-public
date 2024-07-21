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

const { Text, Title } = Typography;
const { TextArea } = Input;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


class ChosenMessageMainContentBottom extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
        this._isMounted = false;
    }

    render() {

        return (
            <div className="bottom" >
                <div className={'chosen-message-bottom'}>
                    <Space>
                        <Button onClick={this.props.onClickReply}> Reply </Button>
                        {
                            this.props.pinned_message.id === this.props.chosen_message.id
                                ?
                                <Button onClick={this.removePinnedMessage} > Unpin </Button>
                                :
                                <Button onClick={this.updatePinnedMessage} > Pin </Button>
                        }
                        <Button disabled={true}> Edit </Button>
                        <Button disabled={true}> Delete </Button>
                    </Space>
                    <Button className={'cancel'} type={'link'} onClick={this.props.onClickCancel}> Cancel </Button>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this._isMounted = true;
        WebSocketInstance.addCallbacks(
            {
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.chat !== prevProps.chat) {
            this.setState({

            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        WebSocketInstance.removeCallbacks(
            {
            }
        );
    }

    updatePinnedMessage = () => {
        WebSocketInstance.waitForSocketConnection(this, (component) => {
            WebSocketInstance.sendMessage(
                {
                    command: 'update_pinned_message',
                    username: component.props.username,
                    chat_id: component.props.chat,
                    message_id: component.props.chosen_message.id,
                }
            );
        });
    }

    removePinnedMessage = () => {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChosenMessageMainContentBottom));
