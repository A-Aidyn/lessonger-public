import React from 'react';
import {Modal, Button, Spin, Divider, Avatar, Space, Typography} from 'antd';
import axios from "axios";
import {LoadingOutlined} from "@ant-design/icons";
import {hostname} from "~/helpers/Consts";
import "~/styles/css/ChatInfo.css";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Text, Title, Paragraph } = Typography;


class JoinChatModal extends React.Component {

    state = {
        error: null,
        data: null
    }

    fetchChat = (chatUUID) => {
        axios.defaults.headers = {
            "Content-Type": "application/json",
            Authorization: `Token ${this.props.token}`
        };
        axios
            .get(`${ hostname }/chat/uuid/${chatUUID}/`)
            .then(res => {
                this.setState({
                    data: res.data
                });
            })
            .catch(err => {
                this.setState({error: err});
            });
    }

    handleOk = () => {

        // authentication
        axios.defaults.headers = {
          Authorization: `Token ${this.props.token}`
        };
        axios
          .get(`${hostname}/chat/join/${this.props.uuid}`)
          .then(res => {
            this.props.close();
          })
          .catch(err => {
            this.setState({
              error: err
            });
          });
    }

    render() {
        if(this.props.uuid && !this.state.error && !this.state.data)
            this.fetchChat(this.props.uuid);
        return (
            <Modal
              centered
              closable={false}
              footer={null}
              visible={this.props.isVisible}
              onCancel={this.props.close}
              onOk={this.handleOk}
              footer={[
                <Button key="back" onClick={this.props.close}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={this.handleOk} disabled={!!this.state.error}>
                  Join
                </Button>,
              ]}
            >
                {
                    this.state.error
                    ?
                        <Text> { this.state.error.response.data.detail } </Text>
                    :
                        !this.state.data
                            ?
                            <Spin indicator={antIcon}/>
                            :
                            <>
                                <div className={'chat-info-header'} >
                                    <Text> Joining a chat </Text>
                                </div>
                                <Divider/>
                                <div className={'chat-info-avatar-name'}>
                                    <div>
                                        <Avatar size={90} icon={<img src={this.state.data.image} />}/>
                                    </div>
                                    <div className={'text-info'}>
                                        <Space direction={"vertical"}>
                                            <Text> {this.state.data.name} </Text>
                                            <Text> {this.state.data.participants.length} participants </Text>
                                        </Space>
                                    </div>
                                </div>
                            </>
                }
            </Modal>
        );
    }
}

export default JoinChatModal;
