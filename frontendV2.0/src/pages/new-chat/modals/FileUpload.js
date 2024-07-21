import React, { Component } from 'react'
import { Upload, Modal, Input, Button, Space, message, Alert } from 'antd';
import { UploadOutlined, UserOutlined, PlusOutlined, SmileTwoTone, InboxOutlined } from '@ant-design/icons';
import {hostname} from "~/helpers/Consts";
import axios from "axios";
import WebSocketInstance from "~/websocket";

const { Dragger } = Upload;


function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const file_types_to_image_or_file = (type) => {
    let tmp = type.split('/');
    if(tmp[0] === 'image')
        return 'i';
    return 'f';
}


class FileUpload extends Component {

    state = {
        previewVisible: false,
        previewImage: '',
        previewTitle: '',
        fileList: [],
        source: null,
        error: ''
    };

    _isMounted = false;

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;

        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}> Upload </div>
            </div>
        );

        let blockSend = false;
        for (let i = 0; i < fileList.length; i ++) {
            if (fileList[i].status !== 'done') {
                blockSend = true;
                break;
            }
        }
        return (

            <Modal
                className={"file-upload-modal"}
                centeredvisible={true}
                visible={this.props.isModalVisible}
                onCancel={this.onCancel}
                footer={
                    <Space>
                        <Button onClick={this.onCancel} >Cancel</Button>
                        <Button type='primary' onClick={this.onSend} disabled={blockSend}>Send</Button>
                    </Space>
                }
                centered={true}
            >
                <Upload
                    action={`${hostname}/files/upload/`}
                    listType="picture-card"
                    fileList={fileList}
                    multiple={false}
                    data={{chat: this.props.chat}}
                    headers={{Authorization: `Token ${this.props.token}`}}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    customRequest={this.customRequest}
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                {this.state.error && <Alert message={this.state.error} type={"warning"} showIcon closable/>}
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Modal>

        );
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

        handleCancel = () => this.setState({ previewVisible: false });

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

    handleChange = (info) => {
        const {fileList} = info;
        this.setState({ fileList });
    }

    customRequest = (info) => {
        const {
            action,
            data,
            file,
            headers,
            onError,
            onProgress,
            onSuccess,
            withCredentials,
        } = info;
        const formData = new FormData();
        if (data) {
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });
        }
        formData.append('file', file);

        for(let pair of formData.entries()) {
        }
        let source = axios.CancelToken.source();
        axios
          .post(action, formData, {
            withCredentials,
            headers,
            onUploadProgress: ({ total, loaded }) => {
              onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
            },
            cancelToken: source.token,
          })
          .then(({ data: response }) => {
            onSuccess(response, file);
          })
          .catch((err) => {
              if(!axios.isCancel(err))
                onError(err);
          });
        this.setState({source: source});
        return {
            abort() {
            },
        };
    }

    onCancel = () => {
        if(this.state.source)
            this.state.source.cancel('Stop uploading the file!');
        this.setState({
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            fileList: [],
            error: '',
            source: null,
        });
        this.props.handleClose();
    }

    onSend = () => {
        if (!this.state.fileList.length) {
            this.setState({error: 'Please choose a file'});
        } else {
            // TODO: Send messages to websocket
            for (let i = 0; i < this.state.fileList.length; i ++) {
                let file = this.state.fileList[i];
                let data = {
                    content: file.name,
                    content_type: file_types_to_image_or_file(file.type),
                    reply_to: this.props.reply_to && this.props.reply_to.id,
                    file_url: file.response.file,
                };
                WebSocketInstance.waitForSocketConnection(this, (component) => {
                    console.assert(this === component);
                    WebSocketInstance.sendMessage(
                        {
                            command: 'new_message',
                            username: component.props.username,
                            chat_id: component.props.chat,
                            data: data,
                        }
                    );
                });
            }
            this.onCancel();
        }
    }
}

export default FileUpload

