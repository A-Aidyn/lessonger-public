import React, { useState } from 'react';
import { Form, Input, Button, Radio, Select } from 'antd';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import {connect} from "react-redux";
import * as messageActions from "~/store/actions/messages";
import * as joinChatActions from "~/store/actions/joinChat";


class JoinChatForm extends React.Component {

    state = {
        error: null
    };

    componentDidMount() {
        // this.props.form.validateFields();
    }

    handleJoinChatButton = (values) => {

        // authentication
        axios.defaults.headers = {
          Authorization: `Token ${this.props.token}`
        };
        axios
          .get(`http://127.0.0.1:8000/chat/${this.props.chatId}/join/`)
          .then(res => {
            this.props.history.push(`/chat/`);
            this.props.closeJoinChatPopup();
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

        return(
                <>
                    <Button type="primary" htmlType="join" onClick={this.handleJoinChatButton}> Join Chat </Button>
                    <Button htmlType="cancel" onClick={this.props.closeJoinChatPopup}> Cancel </Button>
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
    closeJoinChatPopup: () => dispatch(joinChatActions.closeJoinChatPopup()),
    getUserChats: (username, token) => dispatch(messageActions.getUserChats(username, token))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(JoinChatForm)
);
