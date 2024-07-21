import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import {Avatar, Badge, Typography} from 'antd';
import styled, {css} from "styled-components";
import AnimatedDots from "~/pages/new-chat/components/AnimatedDots";
import getStatus from "~/helpers/GetStatus";
import {getChatName} from "~/helpers/GetChatName";
import emoji from 'react-easy-emoji';
/* need to get: chatURL  picURL  chatName  */
const { Text, Title } = Typography;


const Dot = styled.div`
    //margin: 25px 0px 0px 5px;
    //flex-grow: 1;
    flex-shrink: 0;
    margin-left: auto;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    ${props => props.dot && css`
        background: lightgreen;
    `}
`;

const display_users_typing = (users) => {
    if(users.length === 0) {
        return (
            <p> &nbsp; </p>
        );
    }
    if (users.length === 1) {
        return (
            <AnimatedDots className={'preview-side'}> <Text style={{ 'fontSize': '1.8ch', 'marginLeft': '2px' }}> {users[0]} is typing </Text> </AnimatedDots>
        );
    }
    if (users.length > 1) {
        let text = users[0];
        for (let i = 1; i < users.length; i++) {
            text += ', ' + users[i];
        }
        return (
            <AnimatedDots className={'preview-side'}> <Text style={{ 'fontSize': '1.8ch', 'marginLeft': '2px' }}> {text} are typing </Text> </AnimatedDots>
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

const Contact = (props) => {
    const [tmp, setTmp] = useState(0);
    let status = null;
    if (props.chat.target_user_contact) {
        status = getStatus(props.chat.target_user_contact.last_active_time);
        if (status === 'Online') {
            setTimeout(() => {
                setTmp(!tmp);
            }, 5 * 60 * 1000);
        }
    }
    // let name = `${props.chatName} General Chat`;
    // if (props.chat.section !== '0')
    //     name = `${props.chatName} Section ${props.chat.section} Chat`;
    return (
        <div className="contact">
            <div className="icon">
                <Badge offset={[-7, 40]} status={status === 'Online' ? 'success' : null}>
                    <Avatar size={46} src={props.picURL}/>
                </Badge>
            </div>
            <div className="right-part">
                <div className={"name-time"}>
                    <p className="chat-name">{getChatName(props.chat, true)} </p>
                    <p className="chat-time">{props.chatTime} </p>
                </div>
                <div className="last-message">
                    {
                        props.chat.users_typing.length
                            ?
                            display_users_typing(props.chat.users_typing)
                            :
                            <p>{props.lastUser}: {svgEmoji(props.lastMessage ? props.lastMessage : '')}</p>
                    }
                    {
                        props.dot
                            ?
                            <Dot dot={props.dot} />
                            :
                            <Badge
                                className="badge"
                                count={props.unreadCount}
                                style={{ backgroundColor: '#52c41a' }}
                            />
                    }
                </div>
            </div>
        </div>
    );
}

export default Contact;
