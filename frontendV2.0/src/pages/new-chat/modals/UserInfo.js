import React, { useState } from 'react';
import {Button, Typography, Avatar, Space, Divider, Spin, Modal, Form, Input, Upload, Badge} from 'antd';
import { UserOutlined, LoadingOutlined, UploadOutlined , LinkedinOutlined, WhatsAppOutlined, MailOutlined, Icon} from '@ant-design/icons';
import axios from 'axios';
import { connect } from "react-redux";
import "~/styles/css/ChatInfo.css";
import { front_hostname, hostname } from "~/helpers/Consts";
import Kakaotalk from "~/icons/Kakaotalk";
import {withRouter} from "react-router-dom";
import getStatus from "~/helpers/GetStatus";

const { Text, Title, Paragraph } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class UserInfoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            editProfile: false,
            user: '',
        }
    }

    render() {
        let status = null;
        if(this.state.data)
            status = getStatus(this.state.data.last_active_time);
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
                                <Text className={'just-text'}> User Info </Text>
                                {this.props.username === this.state.user && <Button className={'edit-button'} type={"text"} onClick={() => {
                                    this.setState({ editProfile: !this.state.editProfile });
                                }}>
                                    Edit Profile
                                </Button>
                                }
                                <Button className={'close-button'} type={"text"} onClick={this.props.close}> Close </Button>
                            </div>
                            <Divider />
                            {
                                <>
                                    <div className={'chat-info-avatar-name'}>
                                        <div >
                                            <Badge style={{height: 8, width: 8}} status={status === 'Online' ? 'success' : null} offset={[-14, 80]}>
                                                <Avatar  size={90} icon={<img src={this.state.data.image_url} />} />
                                            </Badge>
                                        </div>
                                        <div className={'text-info'}>
                                            <Space direction={"vertical"}>
                                                <Text> {this.state.data.name} {this.state.data.surname}  <Text  type="secondary" >({status})</Text> </Text>

                                                <Text> Position: {this.state.data.position} </Text>
                                                {/*<Text> Anonymous name: {this.state.data.anon_name + ' ' + this.state.data.anon_surname} </Text>*/}

                                                {! (this.state.data.email == '-' || this.state.data.email == '' )         && <Text> <MailOutlined /> <a href = {'mailto: ' + this.state.data.email} target="_blank" > {this.state.data.email} </a>    </Text>}
                                                {! (this.state.data.kakao_talk_id == '-' || this.state.data.kakao_talk_id == '')  && <Text>  <Kakaotalk />
                                                    <a href = {`https://open.kakao.com/o/${this.state.data.kakao_talk_id}`}
                                                        target="_blank" >  {this.state.data.kakao_talk_id} </a>  </Text>}
                                                {! (this.state.data.linkedin == '-' || this.state.data.linkedin == '')       && <Text> <LinkedinOutlined /> <a href = {'https://www.linkedin.com/in/'+ this.state.data.linkedin} target="_blank" > {this.state.data.linkedin} </a>   </Text>}


                                                <Button className={''} type={"primary"} onClick={this.startPrivateChat}> Message </Button>
                                            </Space>
                                        </div>
                                    </div>



                                    {
                                        this.state.editProfile
                                            ?
                                            <>
                                                <Divider />
                                                <Form
                                                    layout="vertical"
                                                    onFinish={this.updateProfile}
                                                >
                                                    {/*<Form.Item*/}
                                                    {/*    label="Anon name"*/}
                                                    {/*    name="anon_name"*/}
                                                    {/*    initialValue={this.state.data.anon_name}*/}
                                                    {/*>*/}
                                                    {/*    <Input />*/}
                                                    {/*</Form.Item>*/}

                                                    {/*<Form.Item*/}
                                                    {/*    label="Anon surname"*/}
                                                    {/*    name="anon_surname"*/}
                                                    {/*    initialValue={this.state.data.anon_surname}*/}

                                                    {/*>*/}
                                                    {/*    <Input />*/}
                                                    {/*</Form.Item>*/}

                                                    <Form.Item
                                                        label="E-mail"
                                                        name="email"
                                                        initialValue={this.state.data.email}
                                                    >
                                                        <Input  addonBefore = {<MailOutlined />} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Kakao Talk"
                                                        name="kakao_talk_id"
                                                        initialValue={this.state.data.kakao_talk_id}
                                                    >
                                                        <Input addonBefore = { <Kakaotalk /> } />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="LinkedIn"
                                                        name="linkedin"
                                                        initialValue={this.state.data.linkedin}
                                                    >
                                                        <Input  addonBefore = {<LinkedinOutlined />} />
                                                    </Form.Item>


                                                    <Form.Item
                                                        label="Image"
                                                        name="image"
                                                        valuePropName='file'
                                                    >
                                                        <Upload
                                                            name="image"
                                                            listType="picture"
                                                            action={`${hostname}/user-profile/update/`}
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

                                                        <Button className={''} type={"text"} onClick={() => {
                                                            this.setState({ editProfile: !this.state.editProfile });
                                                        }}>
                                                            Cancel
                                                        </Button>
                                                    </Form.Item>
                                                </Form>
                                            </>
                                            : <></>
                                    }

                                </>

                            }

                        </>
                }
            </Modal >

        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //this.fetchUser('admin');
        if (!this.props.isVisible && this.state.data != null)
            this.setState({ data: null, editProfile: false, });
        if (this.state.data == null && this.props.isVisible)
            if (this.props.user == null) this.fetchChat(this.props.chat);
            else this.fetchUser(this.props.user);

    }

    startPrivateChat = () => {
        axios
            .get(`${hostname}/chat/with/${this.state.user}`)
            .then(res => {
                this.props.history.push(`/new-chat/${res.data.private_channel_id}/${res.data.chat_id}`);
                window.location.reload();
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    error: err
                });
            });
    }

    updateProfile = (values) => {
        this.setState({ editProfile: !this.state.editProfile })

        let formData = new FormData();

        // if (values.image === undefined) {
        // } else {
        //     console.log('VALUES IMAGE: ' + values.image.file.originFileObj);
        //     formData.append('image', values.image.file.originFileObj);
        // }

        if (values.anon_name === undefined) {
            formData.append('anon_name', this.state.data.anon_name);
        } else formData.append('anon_name', values.anon_name);

        formData.append('anon_surname', values.anon_surname);



        if  (values.email==='' || values.email==='-')
            {formData.append('email', '-');} else {
                formData.append('email', values.email);
            }
        if  (values.kakao_talk_id==='' || values.kakao_talk_id==='-')
            {formData.append('kakao_talk_id', '-');} else {
                formData.append('kakao_talk_id', values.kakao_talk_id);
            }
        if  (values.linkedin==='' || values.linkedin==='-')
            {formData.append('linkedin', '-');} else {
                formData.append('linkedin', values.linkedin);
            }

        axios
            .put(`${hostname}/user-profile/update/`, formData)
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
                if (res.data.participants.length === 2) {
                    if (res.data.participants[0].username === this.props.username) this.fetchUser(res.data.participants[1].username);
                    if (res.data.participants[1].username === this.props.username) this.fetchUser(res.data.participants[0].username);
                }
            });
    }

    fetchUser = (userName) => {
        axios
            .get(`${hostname}/user-profile/${userName}/`)
            .then(res => {
                this.setState({
                    data: res.data,
                    user: userName,
                })
            });
    }

}

export default withRouter(UserInfoModal);
