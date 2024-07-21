import React,  { useState } from 'react';
import { withRouter } from "react-router-dom";
import {Form, Input, Spin, Checkbox, Typography} from 'antd';
import { Link, Redirect } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';

import { Button } from '~/pages/home/globalStyles';

import axios from "axios";
import { hostname } from "~/helpers/Consts";
import '~/styles/css/Login.css';
// import "~/styles/css/Signup.css";
// import 'antd/dist/antd.css';
const { Text, Title } = Typography;


const EmailSend = ({ email_sent, worng }) => {

    const [loading, setLoading] = useState(false);
    const sendEmail = (values) => {
        setLoading(true)
        let formData = new FormData();
        formData.append('email', values.email)
        axios.post(`${hostname}/rest-auth/password/reset/`, {
            email: values.email,
        }).then(
            (res) => {
                setLoading(false)
                if (res.data.detail =='No such user is registered') email_sent( res.data.detail, false);
                else email_sent( res.data.detail, true);

            }
        );
    }

    return (
        <Form
            name="normal_login"
            className="login-form"
            layout="vertical"
            initialValues={{
                remember: true,
            }}
            onFinish={sendEmail}
        >
            <div style={{'width': 'inherit'}} >
                {worng && <Text type={'warning'} > There is no user with such email. Try another one. </Text>}
            </div>
            

            <Form.Item
                name="email"
                label={<Text className={'home-text'}> Enter your email </Text>}
                rules={[
                    {
                        required: true,
                        type: 'email',
                        message: 'Please input your email!',
                    },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="Email" size={'large'}/>
            </Form.Item>
            <Form.Item>
                <Button big fontBig primary={true} className={'login-form-button'}>
                  Reset Password
                </Button>
                {/*<Button  loading={loading} type="primary" htmlType="submit" className="login-form-button">*/}
                {/*    Reset Password*/}
                {/*</Button>*/}
                <Text className={'home-text'}>
                    Or <Link to="/login/">login</Link>
                </Text>
            </Form.Item>
        </Form>
    )


}

const ResetPasswordForm = ({ uid, token, error, success }) => {
    const onFinish = (values) => {
        let formData = new FormData();
        formData.append('email', values.email)
        axios.post(`${hostname}/rest-auth/password/reset/confirm/`, {
            new_password1: values.password,
            new_password2: values.confirm,
            uid: uid,
            token: token,
        }).then(
            (res) => {
                if (res.data.detail == "Password has been reset with the new password.") {
                    success()
                } else {
                    error(res.data);
                }


            }
        );
    }
    return (
        <div className={"signup-container"} >
            <Form
                layout="vertical"
                className={"login-form"}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="password"
                    label={<Text className={'home-text'}> Password </Text>}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(rule, value) {
                                if (getFieldValue('password').length >= 8) {
                                    var isNumerical = true;
                                    var hasNumerical = false;
                                    for (var i = 0; i < getFieldValue('password').length; i++) {
                                        if (getFieldValue('password').charAt(i) < '0' || getFieldValue('password').charAt(i) > '9') {
                                            isNumerical = false;
                                            break;
                                        }
                                    }
                                    for (var i = 0; i < getFieldValue('password').length; i++) {
                                        if (getFieldValue('password').charAt(i) >= '0' && getFieldValue('password').charAt(i) <= '9') {
                                            hasNumerical = true;
                                            break;
                                        }
                                    }
                                    if (!isNumerical && hasNumerical) {
                                        return Promise.resolve();
                                    }
                                    else {
                                        return Promise.reject('Password must contain at least 1 letter and 1 number')
                                    }
                                }
                                return Promise.reject('Password should be at least 8 characters long');
                            },
                        }),
                    ]}
                    hasFeedback
                >
                    <Input.Password size={'large'}/>
                </Form.Item>

                <Form.Item
                    name="confirm"
                    label={<Text className={'home-text'}> Confirm Password </Text>}
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(rule, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('The two passwords that you entered do not match!');
                            },
                        }),
                    ]}
                >
                    <Input.Password size={'large'}/>
                </Form.Item>

                <Form.Item >
                    <Button big fontBig primary={true} className={'login-form-button'}>
                        Reset
                    </Button>
                    {/*<Button type="primary" htmlType="submit">*/}
                    {/*    Reset*/}
                    {/*</Button>*/}
                </Form.Item>
            </Form>
        </div>
    )
}

class PasswordReset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uid: (typeof props.match.params.uidb64 !== 'undefined') ? props.match.params.uidb64 : null,
            token: (typeof props.match.params.token !== 'undefined') ? props.match.params.token : null,
            reset: (typeof props.match.params.token !== 'undefined') & (typeof props.match.params.uidb64 !== 'undefined'),
            sent: false,
            error: false,
            success: false,
            detail: null,
        }

    }

    render() {
        return (
            <>
                {
                    !this.state.success ?
                        <>
                            <div className="login-container">
                                {!this.state.error ?
                                    <>
                                        {
                                            this.state.reset
                                                ?
                                                <>
                                                    <ResetPasswordForm error={(r) => (this.setState({ error: r }))} uid={this.state.uid}
                                                        success={() => (this.setState({ success: true }))}
                                                        token={this.state.token} />
                                                </>
                                                :
                                                <>
                                                    {
                                                        !this.state.sent
                                                            ? <EmailSend worng={this.state.detail =='No such user is registered'} email_sent={(r, sent) => (this.setState({ sent: sent, detail:r }))} />
                                                            :
                                                            
                                                            <div>
                                                                {this.state.detail}
                                                            </div>
                                                    }
                                                </>

                                        }
                                    </>

                                    :
                                    <div>
                                        {this.state.error}
                                    </div>
                                }

                            </div>

                        </>
                        :
                        <div className="login-container">
                            <Text className={'home-text'}>
                                Password changed successfully.
                                You can <Link to="/login/"> login </Link> now
                            </Text>
                        </div>

                }
            </>)
    }

    // componentDidMount() {
    //     document.title = 'Password Reset | Lessonger';
    // }
}

export default withRouter(PasswordReset);