import React, { useState } from 'react';
import { Form, Input, Button, Radio, Select } from 'antd';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import {connect} from "react-redux";
import * as KLMSActions from "~/store/actions/KLMS";
import * as messageActions from "~/store/actions/messages";

class addKLMSForm extends React.Component {

    state = {
        error: null
    };

    getSemester = (month) => {
        if (month >= 9)
            return "Fall";
        else if(month >= 7)
            return "Summer";
        else if(month >= 3)
            return "Spring";
        else
            return "Winter";
    }

    handleOnFinish = (values) => {
        axios.defaults.headers = {
            "Content-Type": "application/json",
            Authorization: `Token ${this.props.token}`
          };
        let date = new Date();
        axios
            .post("http://127.0.0.1:8000/chat/klms/", {
                username: values.KLMSusername,
                password: values.KLMSpassword,
                year: date.getFullYear(),
                semester: this.getSemester(date.getMonth() + 1)
            })
            .then(res => {
              this.props.history.push(`/chat/`);
              this.props.closeKLMSPopup();
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
        };
        const buttonItemLayout = {
          wrapperCol: {
            span: 14,
            offset: 4,
          },
        };
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
                    <Form.Item name="KLMSusername" label="Username" rules={[{ required: true }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item name="KLMSpassword" label="Password" rules={[{ required: true }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item {...buttonItemLayout}>
                        <Button type="primary" htmlType="submit"> Sync </Button>
                    </Form.Item>
                    <button onClick={this.props.closeKLMSPopup}>Close</button>
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
            closeKLMSPopup: () => dispatch(KLMSActions.closeKLMS()),
            getUserChats: (username, token) => dispatch(messageActions.getUserChats(username, token))
        };
    };

    export default withRouter(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(addKLMSForm)
      );
