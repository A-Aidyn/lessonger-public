import React from 'react';
import {Form, Input, Spin, Checkbox, Alert, Typography} from 'antd';
import { connect } from 'react-redux';
import {Link, Redirect, withRouter} from 'react-router-dom';
import * as actions from '~/store/actions/auth';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import '~/styles/css/Login.css';
import styled from "styled-components";
import { Button } from '~/pages/home/globalStyles';
// import '~/styles/css/Verify.css';
// import 'antd/dist/antd.css';

const { Text, Title } = Typography;


const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const FormInput =styled.textarea `
    padding:10px 20px;
    border-radius:2px;
    margin-right:10px;
    
    height:5rem;
    outline:none;
    //border:none;
    font-size:16px;
    color: black;
    border: 1px solid #fff;
    &:place-holder {
        color:#242424;
    }
    @media screen and (max-width: 820px){
        width:100%;
        margin:0 0 16px 0;
    }
`;

class Login extends React.Component {
    onFinish = (values) => {
        this.props.onAuth(values.username, values.password, values.remember);
    };

    onFinishFailed = (errorInfo) => {
    };

    render() {
        if (this.props.isAuthenticated) {
            return <Redirect to={'new-chat'}/>
        }

        let errorMessage = null;
        if (this.props.error) {
            if( this.props.error.response.request.responseText.includes('E-mail is not verified.')){
              errorMessage = (
                <p>Email is not verified</p>
              );
            }
            else if( this.props.error.response.request.responseText.includes('A user is already registered with this e-mail address') ){
              errorMessage = (
                <p>A user with that email already exists</p>
              );
            }
            else if( this.props.error.response.request.responseText.includes('A user with that username already exists')){
              errorMessage = (
                <p>A user with that username already exists</p>
              );
            }
            else if( this.props.error.response.request.responseText.includes('Unable to log in with provided credentials')){
              errorMessage = (
                <p>Login or Password are incorrect</p>
              );
            }
            

            else{
              errorMessage = (
                <p>{this.props.error.response.request.responseText}</p>
              );
              }
        }

        // const { getFieldDecorator } = this.props.form;
        return (
                <>
                {
                    this.props.loading ? <Spin indicator={antIcon} />
                    :
                         <div className="login-container">


                    <Form
                      name="normal_login"
                      className="login-form"
                      initialValues={{
                        remember: true,
                      }}
                      onFinish={this.onFinish}
                    >

                        {errorMessage &&  <Alert message={errorMessage}> </Alert>}

                      <Form.Item
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: 'Please input your Username!',
                          },
                        ]}
                      >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" size={'large'}/>
                      </Form.Item>
                      <Form.Item
                        name="password"
                        rules={[
                          {
                            required: true,
                            message: 'Please input your Password!',
                          },
                        ]}
                      >
                        <Input
                          prefix={<LockOutlined className="site-form-item-icon" />}
                          type="password"
                          placeholder="Password"
                          size={'large'}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>
                              <Text className={'home-text'}>
                                  Remember me
                              </Text>
                          </Checkbox>
                        </Form.Item>

                        <Link to="/passwordreset/">Forgot password</Link>
                      </Form.Item>

                      <Form.Item>
                        <Button big fontBig primary={true} className={'login-form-button'}>
                          Log in
                        </Button>
                          <Text className={'home-text'}>
                                Or  <Link to="/signup/">register now!</Link>
                          </Text>
                      </Form.Item>
                    </Form>
                    </div>
                }
                </>

        );
    }
    componentDidMount() {
        document.title = 'Login | Lessonger';
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.token !== null,
        loading: state.auth.loading,
        error: state.auth.error
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (username, password, remember) => dispatch(actions.authLogin(username, password, remember))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);