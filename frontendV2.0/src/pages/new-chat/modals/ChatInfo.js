import React, { useState } from 'react';
import {Button, Typography, Avatar, Space, Divider, Spin, Modal, Form, Upload, Input, Badge} from 'antd';
import { UserOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { connect } from "react-redux";
import "~/styles/css/ChatInfo.css";
import { withRouter } from "react-router-dom";

import { front_hostname, hostname } from "~/helpers/Consts";
import getStatus from "~/helpers/GetStatus";


const { Text, Title, Paragraph } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


const SmallUserProfile = (props) => {
    let status = getStatus(props.last_active_time);
    return (
        <div className={'small-user-profile'}>
            <div>
                <Badge status={status === 'Online' ? 'success' : null} offset={[-7, 43]}>
                    <Avatar size={50} icon={<img width={50} height={50} src={props.picURL} />} />
                </Badge>
            </div>
            <Space direction={"vertical"} size={3} type="submit" onClick={() => { props.open_user() }}>
                <div className={'user-name-position'}>
                    <Text> {props.display_name} </Text>
                    <Text className={'to-right'}> {props.position} </Text>
                </div>
                <div >
                    <Text> {status} </Text>
                    {props.is_admin && <Text className={'to-right'}> admin </Text>}
                </div>
            </Space>
        </div>
    );
}


class ChatInfoModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            editChat: false,
        }
    }

    render() {
        let users = [];
        if (this.state.data) {
            for (let i = 0; i < this.state.data.participants.length; i++) {
                let chuvak = this.state.data.participants[i];
                let display_name = chuvak.profile.name + ' ' + chuvak.profile.surname;
                if (chuvak.profile.position === 'Unknown')
                    display_name = chuvak.profile.username;
                users.push(
                    <SmallUserProfile
                        key={chuvak.username}
                        display_name={display_name}
                        picURL={chuvak.profile.image}
                        last_active_time={chuvak.profile.last_active_time}
                        position={chuvak.profile.position}
                        is_admin={chuvak.is_admin}
                        open_user={() => { this.props.open_user(this.state.data.participants[i].username) }}
                    />
                );
            }
        }
        return (
            <Modal
                zIndex={this.props.zIndex}
                centered
                footer={null}
                visible={this.props.isVisible}
                onCancel={this.props.close}
                closable={false}
            >
                {
                    !this.state.data
                        ?
                        <Spin indicator={antIcon} />
                        :
                        <>
                            <div className={'chat-info-header'} >
                                <Text className={'just-text'}> Group Chat Info </Text>

                                {!this.state.data.is_channel_course &&
                                <Button className={'edit-button'} type={"text"} onClick={() => {
                                    this.setState({ editChat: !this.state.editChat });
                                }}>
                                    Edit Chat
                                </Button>
                                }

                                <Button className={'close-button'} type={"text"} onClick={this.props.close}> Close </Button>
                            </div>
                            <Divider />
                            <div className={'chat-info-avatar-name'}>
                                <div>
                                    <Avatar size={90} icon={<img src={this.state.data.image} />} />
                                </div>
                                <div className={'text-info'}>
                                    <Space direction={"vertical"}>
                                        <Text> {this.state.data.name} </Text>
                                        <Text> {this.state.data.participants.length} participants </Text>

                                        {!this.props.channel_is_course && <Button className={''} type={"primary"} onClick={() => this.leavechat(this.props.chat)}> Exit chat </Button>}

                                    </Space>
                                </div>
                            </div>

                            {!this.props.channel_is_course && (
                                <>
                                    <Divider />
                                    <div className={'invitation-link'}>
                                        <Text className={'name'}> Invitation link: </Text>
                                        <Text className={'link'} copyable>{front_hostname + '/new-chat/join/' + this.state.data.uuid}</Text>
                                    </div>
                                </>
                            )}

                            <Divider />
                            <div className={'participants-text'}>
                                <Text> Participants </Text>
                            </div>
                            <div className={'participants-container'}>
                                {users}
                            </div>


                            {
                                this.state.editChat &&
                                (
                                    <>
                                        <Divider />
                                        <Form
                                            layout="vertical"
                                            onFinish={this.updateChat}
                                        >
                                            <Form.Item
                                                label="Name"
                                                name="name"
                                                initialValue={this.state.data.name}
                                            >
                                                <Input />
                                            </Form.Item>


                                            <Form.Item
                                                label="Image"
                                                name="image"
                                                valuePropName='file'
                                            >
                                                <Upload

                                                    name="image"
                                                    listType="picture"
                                                    action={`${hostname}/chat/${this.props.chat}/update`}
                                                    multiple={false}
                                                    method={'put'}
                                                    headers={{ Authorization: `Token ${this.props.token}` }}
                                                //customRequest={this.customRequest}
                                                >
                                                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                                                </Upload>

                                            </Form.Item>


                                            <Form.Item >
                                                <Button type="primary" htmlType="submit">
                                                    Done
                                        </Button>
                                                <Button className={'close-button'} type={"text"} onClick={() => {
                                                    this.setState({ editChat: !this.state.editChat });
                                                }}>
                                                    Cancel
                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </>)
                            }

                        </>
                }
            </Modal>

        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.isVisible && this.state.data)
            this.setState({ data: null, editChat: false, });
        if (this.state.data == null && this.props.chat && this.props.isVisible)
            this.fetchChat(this.props.chat);
    }

    leavechat = (chatId) => {

        axios.get(`${hostname}/chat/${chatId}/leave/`).then(res =>{
            this.props.history.push(`/new-chat/${this.props.channel}`);
            window.location.reload();
        });





    }
    updateChat = (values) => {
        this.setState({ editChat: !this.state.editChat })

        let formData = new FormData();

        if (values.image == undefined) {
        } else formData.append('image', values.image.file.originFileObj);

        if (values.name == undefined) {
            formData.append('name', this.state.data.name);
        } else formData.append('name', values.name);

        axios
            .put(`${hostname}/chat/${this.props.chat}/update/`, formData)
            .then(res => {
                this.setState({
                    data: { ...this.state.data, ...res.data, image_url: res.data.image }
                });

            })
            .catch(err => {
                console.error(err);
                this.setState({
                    error: err
                });
            });
    }

    fetchChat = (chatId) => {
        axios
            .get(`${hostname}/chat/${chatId}/`)
            .then(res => {
                this.setState({
                    data: res.data
                });
            });
    }
}


//export default ChatInfoModal;

export default withRouter(ChatInfoModal);