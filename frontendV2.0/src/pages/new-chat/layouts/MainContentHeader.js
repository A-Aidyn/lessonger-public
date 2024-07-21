import React from 'react';

import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Comment, Tooltip, Input, Upload, Dropdown, Spin } from 'antd';

import {connect} from "react-redux";
import ChatInfoModal from "~/pages/new-chat/modals/ChatInfo";
import UserInfoModal from "~/pages/new-chat/modals/UserInfo";
import * as authActions from "~/store/actions/auth";
import {getChatName} from "~/helpers/GetChatName";
import axios from "axios";
import {hostname} from "~/helpers/Consts";
import {displayUserName} from "~/helpers/DisplayUserName";
import getStatus from "~/helpers/GetStatus";

import ThreeDotsIcon from "~/media/dots_three_outline_vertical_icon_173863.svg";
import LogoutIcon from "~/media/log-out.svg";
import GroupIcon from "~/media/group-fill.svg";


const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;


class MainContentHeader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            chat_info_modal_visibility: false,
            user_info_modal_visibility: false,
            user_profile_shown: null,
            user_object: null,
        };
        this.fetchUserProfile();
        console.log("[MainContentHeader] constructor is called!");
    }

    render() {

        let menu = null;
        if (this.state.user_object) {
            // console.log(this.state.user_object);
            menu = (
                <Menu className={'menu-drop'}>
                    <Menu.Item onClick={this.openUserInfo}>
                        <Avatar size={64} className={'user-profile-photo'} src={this.state.user_object.image_url}/>
                        {/*<Button className={"user-profile-button"} type="primary"> </Button>*/}
                        <Text> {displayUserName(this.state.user_object)} </Text>
                    </Menu.Item>
                    <Menu.Item className={'profile-menu-item'} onClick={this.props.logout}>
                        <>
                            <LogoutIcon style={{marginRight: 10}} height={20} width={20} />
                            <span>Log out</span>
                        </>
                    </Menu.Item>
                </Menu>
            );
        }

        let channel_is_course = false;
        if (this.props.channel_object)
            channel_is_course = this.props.channel_object.is_course;

        let modals = [
            (
                <ChatInfoModal
                    zIndex = {1000}
                    key={1}
                    channel = {this.props.channel}
                    channel_is_course={channel_is_course}
                    chat={this.props.chat}
                    token = {this.props.token}
                    isVisible={this.state.chat_info_modal_visibility}
                    user = {this.state.user_profile_shown}
                    close={() => this.setState({chat_info_modal_visibility: false})}
                    open_user = { (username)=> {
                        this.setState ({
                            user_info_modal_visibility: true,
                            user_profile_shown: username,
                        })
                    } }
                    username = {this.props.username}
                    open_user_privite = { (username)=> {
                        this.setState ({
                            user_info_modal_visibility: true,
                            user_profile_shown: username,
                            chat_info_modal_visibility: false
                        })
                    } }

                />
            ),
            (
                <UserInfoModal
                    zIndex = {1001}
                    key={2}
                    chat={this.props.chat}
                    token = {this.props.token}
                    user = {this.state.user_profile_shown}
                    username = {this.props.username}
                    isVisible={this.state.user_info_modal_visibility}
                    close={() => this.setState({user_info_modal_visibility: false, user_profile_shown: null,})}
                />
            ),
        ];
        console.log(this.props.chat_object);
        return (
            <>
                { modals }
                <Header className="header">
                    <div className={this.props.chat ? 'box-1 box hover-box' : 'box-1 box'}  onClick={this.openChatInfo}>
                        <div className={"chat-name"}>
                            <Space size={1} direction={"vertical"} align={"center"} >
                                {
                                    this.props.chat_object === null
                                    ?
                                        null
                                    :
                                        this.props.chat_object.is_private
                                        ?
                                            <>
                                                <Title className={'title-text'} level={4} style={{fontWeight: 'bold'}}> { getChatName(this.props.chat_object) } </Title>
                                                {
                                                    this.props.chat_object.target_user_contact &&
                                                    <Text className={'sub-text'}>
                                                        {
                                                            getStatus(this.props.chat_object.target_user_contact.last_active_time) === 'Online'
                                                                ?
                                                                <Badge color="lime" />
                                                                :
                                                                null
                                                        }
                                                        { getStatus(this.props.chat_object.target_user_contact.last_active_time) }
                                                    </Text>
                                                }
                                            </>
                                        :
                                            <>
                                                <Title className={'title-text'} level={4} style={{ fontWeight: 'bold'}} > { getChatName(this.props.chat_object) } </Title>
                                                <Text className={'sub-text'}>
                                                    <GroupIcon width={15} height={15} fill={'white'} style={{marginRight: 5}}/>
                                                    { this.props.chat_object.participants_count } participants
                                                </Text>
                                            </>
                                }
                            </Space>
                        </div>
                    </div>
                    {/*<Text className={"user-name-surname"} onClick = {this.openUserInfo} > { this.props.username } </Text>*/}
                    <Dropdown overlay={menu} placement="bottomRight" trigger='click' >
                        <div className={'box-2 box hover-box'} >
                            <ThreeDotsIcon className={"user-profile-button"} width={28} height={28} fill={'white'} />
                        </div>
                    </Dropdown>
                </Header>
            </>
        );
    }

    openChatInfo = () => {
        if(!this.props.chat_object)
            return;
        if (this.props.chat_object.is_private) {
            if (this.props.chat_object.participants_count ===1 ) {
                this.setState({user_profile_shown: this.props.username, user_info_modal_visibility: true});
            }
            if (this.props.chat_object.participants_count===2) {
                this.setState({user_info_modal_visibility: true, user_profile_shown: null});
            }
        } else {
            this.setState({chat_info_modal_visibility: true});
        }
    }

    openUserInfo = () => {
        this.setState({user_info_modal_visibility: true, user_profile_shown: this.props.username,});
    }

    fetchUserProfile = () => {
        axios
            .get(`${ hostname }/user-profile/${this.props.username}/`)
            .then(res => {
                this.setState({user_object: res.data});
            });
    }

}

const mapStateToProps = (state) => {
    return {
        token: state.auth.token,
        username: state.auth.username
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(authActions.logout()),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(MainContentHeader);
