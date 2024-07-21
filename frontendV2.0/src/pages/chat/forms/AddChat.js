import React, { useState } from 'react';
import { Form, Input, Button, Radio, Select } from 'antd';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import {connect} from "react-redux";
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";


class AddChatForm extends React.Component {

    state = {
        error: null
    };

    componentDidMount() {
        // this.props.form.validateFields();
    }

    handleOnFinish = (values) => {

        // authentication
        axios.defaults.headers = {
          "Content-Type": "application/json",
          Authorization: `Token ${this.props.token}`
        };
        axios
          .post("http://127.0.0.1:8000/chat/create/", {
              name: values.chat_name,
              messages: [],
              participants: [this.props.username]
          })
          .then(res => {
            this.props.history.push(`/chat/`);
            this.props.closeAddChatPopup();
            this.props.getUserChats(this.props.username, this.props.token);
          })
          .catch(err => {
            console.error(err);
            this.setState({
              error: err
            });
          });
    };

    render () {

        const formItemLayout = {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 14,
          },
        }
        const buttonItemLayout = {
          wrapperCol: {
            span: 14,
            offset: 4,
          },
        }
        return(
                <Form
                    {...formItemLayout}
                    layout="horizontal"
                    initialValues={{
                        layout: "horizontal",
                    }}
                    onFinish={this.handleOnFinish}
                >
                    {this.state.error ? `${this.state.error}` : null}
                    <Form.Item name="chat_name" label="Chat Name" rules={[{ required: true }]} >
                        <Input />
                    </Form.Item>
                    {/*<Form.Item label="Field A">*/}
                    {/*    <Select*/}
                    {/*        mode="tags"*/}
                    {/*        style={{width: "100%"}}*/}
                    {/*        placeholder="Add a user"*/}
                    {/*        onChange={this.handleChange}*/}
                    {/*    >*/}
                    {/*        {[]}*/}
                    {/*    </Select>*/}
                    {/*</Form.Item>*/}
                    <Form.Item {...buttonItemLayout}>
                        <Button type="primary" htmlType="submit"> Start a chat </Button>
                    </Form.Item>
                </Form>
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