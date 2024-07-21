import React from 'react';
import {
    Form,
    Input,
    Typography,
} from 'antd';

import { Button } from '~/pages/home/globalStyles';

import { connect } from 'react-redux';
import * as actions from "~/store/actions/auth";
import {Link, Redirect, withRouter} from 'react-router-dom';
import "~/styles/css/Login.css";
import {MailOutlined, UserOutlined, LockOutlined} from "@ant-design/icons";
// import 'antd/dist/antd.css';
const { Text, Title } = Typography;


class RegistrationForm extends React.Component {

    componentDidMount() {
        this._isMounted = true;
        document.title = 'Signup | Lessonger';
    }

  onFinish = values => {
    this.props.onSignup(values.username, values.email, values.password, values.confirm);
    this.props.history.push('/verify/'); // Redirect to home page. TODO: add email confirmation
  };


  render() {
    return (
        <div className={"login-container"} >
            <Form
                className={"login-form"}
                name="register"
                layout={'vertical'}
                onFinish={this.onFinish}
                scrollToFirstError
            >
              <Form.Item
                  label={<Text className={'home-text'}> Username </Text>}
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your username!',
                    },
                  ]}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" size={'large'}/>
              </Form.Item>

              <Form.Item
                  name="email"
                  label={<Text className={'home-text'}> Email </Text>}
                  rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" size={'large'}/>
              </Form.Item>

              <Form.Item
                  name="password"
                  label={<Text className={'home-text'}> Password </Text>}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                    ({getFieldValue}) =>({
                      validator(rule, value){
                        if(getFieldValue('password').length >= 8){
                          var isNumerical = true;
                          var hasNumerical = false;
                          for(var i = 0; i < getFieldValue('password').length ; i++){
                            if(getFieldValue('password').charAt(i) < '0' || getFieldValue('password').charAt(i) > '9'){
                              isNumerical = false;
                              break;
                            }
                          }
                          for(var i = 0; i < getFieldValue('password').length ; i++){
                            if(getFieldValue('password').charAt(i) >= '0' && getFieldValue('password').charAt(i) <= '9'){
                              hasNumerical = true;
                              break;
                            }
                          }
                          if(!isNumerical && hasNumerical){
                            return Promise.resolve();
                          }
                          else{
                            return Promise.reject('Password must contain at least 1 letter and 1 number')
                          }
                        }
                        return Promise.reject('Password should be at least 8 characters long');
                      },
                    }),
                  ]}
                  hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size={'large'}/>
              </Form.Item>

              <Form.Item
                  name="confirm"
                  label={<Text className={'home-text'}> Confirm password </Text>}
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    ({getFieldValue}) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('The two passwords that you entered do not match!');
                      },
                    }),
                  ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size={'large'}/>
              </Form.Item>

              <Form.Item >
                  <Button big fontBig primary={true} className={'login-form-button'}>
                    Signup
                  </Button>
                {/*<Button className={'login-form-button'} type="primary" htmlType="submit">*/}
                {/*Register*/}
                {/*</Button>*/}
                <Text className={'home-text'}>
                    or if you already have an account, <Link to="/login/">  login</Link>
                </Text>
            </Form.Item>
            </Form>

        </div>
    );
  }

}

const mapStateToProps = (state) => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSignup: (username, email, password1, password2) => dispatch(actions.authSignup(username, email, password1, password2))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegistrationForm));

