import React from 'react';
import {Button, Modal, Divider } from 'antd';
import '~/styles/css/UserProfilePopup.css';
import axios from "axios";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import UserProfileEditModal from "./UserProfileEdit";


class UserProfileModal extends React.Component {

    constructor() {
        super();
        this.state = {editing: false}
    }

    fetchChat = () => {
        this.props.close();
        axios.defaults.headers = {
          "Content-Type": "application/json",
          Authorization: `Token ${this.props.token}`
        };
        axios
          .get(`http://127.0.0.1:8000/chat/with/${this.props.username}`)
          .then(res => {
              this.props.history.push(`/chat/${res.data}`);
              window.location.reload();
          })
          .catch(err => {
            console.error(err);
            this.setState({
              error: err
            });
          });
    }

    editProfile = () => {
        this.setState({editing: true});
    }

    closeEditPopup = () => {
        this.setState({editing: false});
    }

    render() {
        let customFooter = [ (<Button key="chat" type={"primary"} onClick={this.fetchChat}> Chat </Button>) ];
        if (this.props.targetUsername === this.props.username) {
            customFooter = [(<Button key="edit" onClick={this.editProfile}> Edit </Button>), ...customFooter]
        }
        return (

            <Modal
              centered
              footer={null}
              visible={this.props.isVisible}
              onCancel={this.props.close}
              bodyStyle={{padding: "0px"}}
              footer={customFooter}
            >
                <div className="card hovercard">
                    <div className="cardheader">
                    </div>
                    <div className="avatar">
                        <img alt="" src={this.props.targetUserInfo.image_url}/>
                    </div>
                    <div className="info">
                        <div className="title">
                            <a>@{this.props.targetUsername}</a>
                        </div>
                        <Divider orientation="left" plain> Name </Divider>
                        <p> {this.props.targetUserInfo.name} </p>

                        <Divider orientation="left" plain> Surname </Divider>
                        <p> {this.props.targetUserInfo.surname} </p>

                        <Divider orientation="left" plain> Position </Divider>
                        <p> {this.props.targetUserInfo.position} </p>

                    </div>
                </div>

                <UserProfileEditModal
                    isVisible={this.state.editing}
                    token={this.props.token}
                    close={this.closeEditPopup}
                />
            </Modal>

        );
    }
}

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        token: state.auth.token,
        targetUsername: state.userProfile.targetUsername,
        targetUserInfo: state.userProfile.targetUserInfo,
    }
}

export default withRouter(connect(mapStateToProps)(UserProfileModal));
