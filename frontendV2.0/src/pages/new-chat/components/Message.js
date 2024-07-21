import React, { Component } from 'react';
import {Avatar, Comment, Tooltip, Image, Space, Typography} from 'antd';
import moment from 'moment';
import { Upload, Button } from 'antd';
import { UploadOutlined, StarOutlined } from '@ant-design/icons';
import {FileOutlined, CheckOutlined } from '@ant-design/icons';
import axios from "axios";
import {hostname} from "~/helpers/Consts";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import { Base64 } from 'js-base64';
import styled, { css } from 'styled-components';
import Linkify from 'react-linkify';
import Repliedto from "~/pages/new-chat/components/Repliedto";
import emoji from 'react-easy-emoji';

const { Text, Title, Link, Paragraph } = Typography;

const Dot = styled.div`
    margin: 25px 0px 0px 5px;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    ${props => props.dot && css`
        background: lightgreen;
    `}
`;

const FileDownload = require('js-file-download');


class Message extends React.Component {

    render() {
        let {message, max_last_read_message, username, open_user} = this.props;
        let {contact, timestamp, content, content_type, file_url, image, reply_to} = message;
        let author = contact.name + ' ' + contact.surname;
        if (contact.position === 'unknown')
            author = contact.username;
        let not_found_image = "data:image/jpeg;base64,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";
        let className = 'dot';
        if(content_type === 'i' && !image)
            content_type = 'f';
        return (
            <Space className={`message-item ${(this.props.chosen_message && this.props.chosen_message.id === this.props.id) ? 'clicked-message' : null}`} id={this.props.id} onClick={this.props.onClick} align={'start'} size={3}>
                <Dot dot={(contact.username === username && message.id > max_last_read_message)} />
                <Comment
                    id={this.props.id}
                    style = {{'marginLeft': '5px', minWidth: 0}}
                    author={<a ref={'#'} onClick={ (e) => {
                        e.stopPropagation();
                        open_user( contact.username )
                    } } > { author } ({contact.position}) </a>}
                    avatar={contact.image}

                    content = {
                        (
                            <div>
                                <Repliedto
                                    onClickReplyTo={this.props.onClickReplyTo}
                                    reply_to={reply_to}
                                    removable={false}
                                />
                                {
                                    (content_type === 'i') ? <Image onClick = {(e) => (e.stopPropagation())}  width={Math.min(200, image.width)} src={image.data} onLoad={this.props.onLoad} fallback={not_found_image}/>
                                    :
                                    (content_type === 'f') ? <a href={'#'} rel="noopener noreferrer" onClick={(e) => {e.stopPropagation(); this.getFile(file_url, content);}} > <p >  <FileOutlined/>  {content} </p> </a>
                                    :
                                     <Linkify>
                                        <span> {this.svgEmoji(content ? content : '')}</span>

                                    </Linkify>


                                }
                            </div>
                        )
                    }
                    datetime={
                        <Tooltip title={moment(timestamp).format('MMMM Do YYYY, h:mm:ss a')}>
                            <span>  {moment(timestamp).calendar()// .format('HH:mm')
                            } </span>
                        </Tooltip>
                    }
                />
            </Space>
        )
    }

    getFile = (file_url, file_name) => {
        axios({
            url: file_url,
            method: 'GET',
            responseType: 'blob',
        }).then((response) => {
            FileDownload(response.data, file_name);
        });
    }
    svgEmoji = (input) => {
        return emoji(input, {
            baseUrl: 'https://twemoji.maxcdn.com/2/svg/',
            ext: '.svg',
            size: ''
        });
    }
}

export default Message;
