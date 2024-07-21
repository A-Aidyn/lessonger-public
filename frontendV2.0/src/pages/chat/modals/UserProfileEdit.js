import React from 'react';
import {Button, Modal, Divider, Form, Input} from 'antd';
import {PictureOutlined, DeleteOutlined} from '@ant-design/icons';
// import ImageUploading from "react-images-uploading";
import ReactRoundedImage from "react-rounded-image";
import FormData from 'form-data';

import axios from "axios";


class UserProfileEditModal extends React.Component {
    state = {
        images: [],
        loading: false
    }

    formRef = React.createRef();
    profilePictureRef = React.createRef();

    saveChanges = () => {
        let user_name = this.formRef.current.getFieldValue("user_name");
        let user_surname = this.formRef.current.getFieldValue("user_surname");
        let image = this.state.images[0];
        let data = new FormData();
        data.append('name', user_name);
        data.append('surname', user_surname);
        data.append('image', image.file, image.file.name);
        this.setState({loading: true});
        axios.defaults.headers = {
          'Content-type': 'multipart/form-data',
          Authorization: `Token ${this.props.token}`
        };
        axios
          .put("http://127.0.0.1:8000/user-profile/update/", data)
          .then(res => {
              this.setState({loading: false});
              this.props.close();
              window.location.reload();
          })
          .catch(err => {

          });
    }

    cancelChanges = () => {
        this.props.close();
    }


    imageOnChange = (imageList, appUpdateIndex) => {
        this.setState({images: imageList})
    }

    handleOnFinish = (values) => {
    }

    render() {
        const formItemLayout = {
          labelCol: {
            span: 6,
          },
          wrapperCol: {
            span: 14,
          },
        };
        const formTailLayout = {
          wrapperCol: {
            offset: 6,
            span: 16,
          },
        };
        return (
            <Modal
              centered
              footer={null}
              visible={this.props.isVisible}
              closable={false}
              onCancel={this.props.close}
              width={420}
              // bodyStyle={{padding: "0px"}}
              // footer={[
              //     (<Button key="cancel" onClick={this.cancelChanges}> Cancel </Button>),
              //     (<Button key="save" type={"primary"} onClick={this.saveChanges}> Save </Button>)
              // ]}
            >
                <Form
                    ref={this.formRef}
                    layout="horizontal"
                    onFinish={this.handleOnFinish}
                >
                    {/*<Form.Item {...formTailLayout} >*/}
                    {/*    <ImageUploading*/}
                    {/*        multiple*/}
                    {/*        value={this.state.images}*/}
                    {/*        onChange={this.imageOnChange}*/}
                    {/*        maxNumber={1}*/}
                    {/*        dataURLKey="data_url"*/}
                    {/*      >*/}
                    {/*        {({*/}
                    {/*          imageList,*/}
                    {/*          onImageUpload,*/}
                    {/*          onImageRemoveAll,*/}
                    {/*          onImageUpdate,*/}
                    {/*          onImageRemove,*/}
                    {/*          isDragging,*/}
                    {/*          dragProps*/}
                    {/*        }) => (*/}
                    {/*          // write your building UI*/}
                    {/*          <div className="upload__image-wrapper">*/}
                    {/*            {imageList.map((image, index) => (*/}
                    {/*              <ReactRoundedImage image={image.data_url} />*/}
                    {/*            ))}*/}
                    {/*            <br/>*/}
                    {/*            <Button type="primary"*/}
                    {/*                    shape="round"*/}
                    {/*                    icon={<PictureOutlined />}*/}
                    {/*                    size={'small'}*/}
                    {/*                    style={isDragging ? { color: "yellow" } : null}*/}
                    {/*                    onClick={onImageUpload}*/}
                    {/*                    {...dragProps}*/}
                    {/*            >*/}
                    {/*                Choose*/}
                    {/*            </Button>*/}

                    {/*            &nbsp;*/}

                    {/*            <Button type="primary"*/}
                    {/*                    danger*/}
                    {/*                    shape="round"*/}
                    {/*                    icon={<DeleteOutlined />}*/}
                    {/*                    size={'small'}*/}
                    {/*                    style={isDragging ? { color: "yellow" } : null}*/}
                    {/*                    onClick={onImageRemoveAll}*/}
                    {/*                    {...dragProps}*/}
                    {/*            >*/}
                    {/*                Remove*/}
                    {/*            </Button>*/}

                    {/*          </div>*/}
                    {/*        )}*/}
                    {/*    </ImageUploading>*/}
                    {/*</Form.Item>*/}
                    <Form.Item {...formItemLayout} name="user_name" label="Name" >
                        <Input placeholder='Please input your name'/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} name="user_surname" label="Surname" >
                        <Input placeholder='Please input your surname'/>
                    </Form.Item>

                    <Form.Item {...formTailLayout}>
                        <Button onClick={this.cancelChanges}> Cancel </Button>
                        <Button type="primary" style={{margin: '0 32px',}} onClick={this.saveChanges} loading={this.state.loading}> Save </Button>
                    </Form.Item>
                </Form>
            </Modal>

        );
    }
}

// const mapStateToProps = (state) => {
//     return {
//         username: state.auth.username,
//         token: state.auth.token,
//         targetUsername: state.userProfile.targetUsername,
//         targetUserInfo: state.userProfile.targetUserInfo,
//     }
// }

export default UserProfileEditModal;
