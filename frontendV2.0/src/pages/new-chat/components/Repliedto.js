import React from "react";
import { NavLink } from 'react-router-dom';
import {Avatar, Badge, Button, Space, Typography} from 'antd';
import styled, {css} from "styled-components";
import AnimatedDots from "~/pages/new-chat/components/AnimatedDots";
import {CloseOutlined} from "@ant-design/icons";
import '~/styles/css/RepliedTo.css';
/* need to get: chatURL  picURL  chatName  */
const { Text, Title } = Typography;

const showContact = (contact) => {
    if (contact.position === 'unknown') {
        return contact.username;
    }
    return contact.name + ' ' + contact.surname;
}

const showContent = (message) => {
    if (message.content_type === 'i') {
        return 'Attached image';
    }
    return message.content;
}

const Repliedto = (props) => {
    return (
        Object.entries(props.reply_to).length
            ?
            <div className={'replied-message-container'}
                 onClick={(e) => {
                     e.stopPropagation();
                     props.onClickReplyTo();
                 }}>
                <div className={'vertical-bar'}/>
                <div className={'text-block'}>
                    <Space direction={'vertical'} size={2}>
                        <Text style={{fontSize: '13px'}}> {showContact(props.reply_to.contact)} </Text>
                        <Text style={{fontSize: '12px'}} className={'message-preview'} ellipsis={true}> {showContent(props.reply_to)} </Text>
                    </Space>
                </div>
                {
                    props.removable && (
                        <div className={'remove'}>
                            <Button
                                style={{fontSize: 10}}
                                ghost
                                shape={'circle'}
                                icon={<CloseOutlined style={{fontSize: 10}}/>}
                                onClick={props.remove}
                            />
                        </div>
                    )
                }
            </div>
            :
            null

    )
}

export default Repliedto;