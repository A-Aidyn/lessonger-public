import React, { useState } from 'react';
import { Form, Input, Button, Radio, Select, Upload, Modal, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import {connect} from "react-redux";
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";
import {hostname} from "~/helpers/Consts";


function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng)
        message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M)
        message.error('Image must smaller than 2MB!');
    return isJpgOrPng && isLt2M;
}

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

class AddChatForm extends React.Component {

    state = {
        error: null,
        loading: false,
        previewVisible: false,
        previewImage: '',
        previewTitle: '',
        fileList: []
    };

    handleCancel = () => this.setState({previewVisible: false});

    handleOnFinish = (values) => {
        axios.defaults.headers = {
          "Content-Type": "application/json",
          Authorization: `Token ${this.props.token}`
        };

        const formData = new FormData();

        formData.append('name', values.chat_name);

        if(this.state.fileList.length) {
            formData.append('image', this.state.fileList[0].originFileObj);
        }

        axios
          .post(`${hostname}/chat/create/`, formData)
          .then(res => {
              if (this.props.channel)
                  this.props.history.push(`/new-chat/${this.props.channel}`);
              else
                  this.props.history.push(`/new-chat`);
              window.location.reload();
              this.handleCancel();
          })
          .catch(err => {
            console.error(err);
            this.setState({
              error: err
            });
          });
    };

    handleChange = info => {

        const { fileList } = info;

        this.setState({fileList});

    };

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    customRequest = (info) => {
        const { onSuccess, file } = info;
        onSuccess(null, file);
        return {
            abort() {
            }
        }
    }

    render () {
        const { loading, previewVisible, previewImage, fileList, previewTitle } = this.state;
        const uploadButton = (
            <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Upload your chat picture</div>
            </div>
        );
        const buttonItemLayout = {
          wrapperCol: {
            span: 14,
            offset: 5,
          },
        }

        let blockSend = false;
        for (let i = 0; i < fileList.length; i ++) {
            if (fileList[i].status !== 'done') {
                blockSend = true;
                break;
            }
        }

        return(
            <>
                <Form
                    layout="horizontal"
                    initialValues={{
                        layout: "horizontal",
                    }}
                    onFinish={this.handleOnFinish}
                >
                    {this.state.error ? `${this.state.error}` : null}
                    <Form.Item
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload
                            className="chat-pic-uploader"
                            name="chat_pic"
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            onChange={this.handleChange}
                            onPreview={this.handlePreview}
                            customRequest={this.customRequest}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </Form.Item>
                    <Form.Item name="chat_name" label="Chat Name" rules={[{ required: true }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item {...buttonItemLayout}>
                        <Button type="primary" htmlType="submit" disabled={blockSend}> Start a chat </Button>
                    </Form.Item>
                </Form>
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </>
        );
    }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    username: state.auth.username
  };
};


const mapDispatchToProps = dispatch => {
  return {
    closeAddChatPopup: () => dispatch(navActions.closeAddChatPopup()),
    getUserChats: (username, token) => dispatch(messageActions.getUserChats(username, token))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddChatForm)
);