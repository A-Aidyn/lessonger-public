import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Spin, Checkbox } from 'antd';
import {NavLink, Redirect, Link, withRouter} from 'react-router-dom';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import '~/styles/css/Verify.css';
// import 'antd/dist/antd.css';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class VerifyMessage extends React.Component {
    render(){

        let errorMessage = null;
        if(this.props.error){
          if( this.props.error.response.request.responseText == '{"non_field_errors":["E-mail is not verified."]}' ){
            errorMessage = (
              <div className="message-container">
                <p className="confirmation-line">Email Confirmation</p>
                <p className="confirmation-line2">Almost there! We have sent you a confirmation link via email, please follow that link to get started!</p>
              </div>
            );
          }
          else{
            if( this.props.error.response.request.responseText.includes('A user is already registered with this e-mail address') ){
              errorMessage = (
                <div>
                <p>A user with that email already exists</p>
                try  <Link to="/signup/"> signing up </Link>with different email, or, try to 
                <Link to="/login/"> log in</Link>
                </div>
              );
            }
            else if( this.props.error.response.request.responseText.includes('A user with that username already exists')){
              errorMessage = (
                <div>
                <p>Username you tried is already taken\n</p>
                <Link to="/signup/"> try another one!</Link>
                </div>
              );
            }
            else{
              errorMessage = (
                <p>{this.props.error.response.request.responseText}</p>
              )
            }
          }
    }
    else{
      errorMessage = (
        <div className="message-container">
          <p className="confirmation-line">Email Confirmation</p>
          <p className="confirmation-line2">Almost there! We have sent you a confirmation link via email, please follow that link to get started!</p>
        </div>
      );
    }
    return(
      <div>
        {
          this.props.loading ?

          <Spin indicator={antIcon} />

          :

          errorMessage
        }
      </div>);
}
}
const mapStateToProps = (state) => {
  return {
      loading: state.auth.loading,
      error: state.auth.error
  }
}

const mapDispatchToProps = dispatch => {
  return {

  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VerifyMessage));