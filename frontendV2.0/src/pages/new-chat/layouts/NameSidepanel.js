import React from "react";
import {NavLink, withRouter} from 'react-router-dom';
import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Popover, Spin } from 'antd';
import {PlusOutlined, NotificationOutlined, RedoOutlined, LoadingOutlined} from '@ant-design/icons';
import Contact from "../components/Contact";
import {connect} from "react-redux";
import axios from "axios";
import {hostname, front_hostname} from "~/helpers/Consts";
import AddChatModal from "~/pages/new-chat/modals/AddChat";
import JoinChatModal from "~/pages/new-chat/modals/JoinChat";
import WebSocketInstance from "~/websocket";
import PlusIcon from "~/media/Plus_icon-icons.com_71848.svg";

const { Header, Sider } = Layout;
const { Text, Title } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;



class NameSidepanel extends React.Component {

    baseState = {
        add_chat_modal: false,
        chats: [],
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.baseState,
            initial_setup: (props.chat !== 0),
        };
        this._isMounted = false;
    }

    render () {
        let modals = [
            (
                <AddChatModal
                    key={1}
                    isVisible={this.state.add_chat_modal}
                    close={() => {this.setState({add_chat_modal: false})}}
                    channel={this.props.channel}
                />
            ),
        ];
        let is_course = true;
        if (this.props.channel && this.props.channel_object && this.props.channel_object.id === this.props.channel)
            is_course = this.props.channel_object.is_course;
        let title = 'Private';
        if (this.props.channel_object && this.props.channel_object.code)
            title = this.props.channel_object.code;

        return (
            <>
                {modals}
                <Sider className={"chat-layout-name-sidepanel"} theme={"light"} width={300}>
                    <Header className="header">
                        <Title className={'title-text'} level={4} style={{fontWeight: 'bold'}} onClick={() => this.props.history.push('/')}> Lessonger </Title>

                        {/*<Text className="title" level={5}> lessonger </Text>*/}
                    </Header>
                    {
                        (this.props.channel !== 0 && this.props.channel_object)
                            ?
                                <>
                                    <div className={'chat-info'} >
                                        <Title level={2} className={'text'}> {title} Chats </Title>
                                        {
                                            (!is_course)
                                                ?
                                                <Popover content={"Create a new chat"}>
                                                    <PlusIcon
                                                        width={35}
                                                        heigth={35}
                                                        className={'rounded-button'}
                                                        onClick={() => this.setState({add_chat_modal: true})}
                                                    />
                                                </Popover>
                                                : null
                                        }
                                    </div>
                                    {
                                        this.state.chats.length
                                        ?
                                        this.showChats()
                                        :
                                        <Spin indicator={antIcon} />
                                    }
                                </>
                            :
                            <div className={"content"}>
                                <Text> Choose a channel </Text>
                            </div>
                    }
                </Sider>
            </>
        );
    }

    componentDidMount() {
        this._isMounted = true;
        // TODO: consider changing this
        WebSocketInstance.addCallbacks(
            {
                'new_message': this.receiveNewMessage,
                'update_last_read_messages': this.receiveUpdateMaxLastReadMessage,
                'user_typing': this.receiveUserTyping,
                'update_pinned_message': this.receiveUpdatePinnedMessage,
                'update_last_active_time': this.receiveUpdateLastActiveTime,
            }
        );
        this.setState({chats: []}, () => this.getChats(this.props.channel));

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log('prevProps: ', prevProps);
        // console.log('thisProps: ', this.props);
        // console.log('prevState: ', prevState);
        // console.log('thisState: ', this.state);
        if(this.props.channel !== prevProps.channel) {
            this.setState(this.baseState, () => this.getChats(this.props.channel));
            return;
        }
        if (this.state.initial_setup && this.state.chats.length) {
            this.chatChange({key: this.props.chat});
            this.setState({initial_setup: false});
        }
    }

    componentWillUnmount() {

        this._isMounted = false;
        WebSocketInstance.removeCallbacks(
            {
                'new_message': this.receiveNewMessage,
                'update_last_read_messages': this.receiveUpdateMaxLastReadMessage,
                'user_typing': this.receiveUserTyping,
                'update_pinned_message': this.receiveUpdatePinnedMessage,
                'update_last_active_time': this.receiveUpdateLastActiveTime,
            }
        );
    }

    doRelevantUpdates = (chatId) => {
        let cur_chat = this.getChatCopy(chatId);
        WebSocketInstance.sendMessage({
            command: 'update_unread_count_in_channel',
            channel_id: this.props.channel,
            chat_id: chatId,
            cnt: -cur_chat.unread_count
        }, false);
        cur_chat.unread_count = 0;
        let prev_chat = this.getChatCopy(this.props.chat);
        if(prev_chat.last_message && prev_chat.last_message.hasOwnProperty('id') && prev_chat.last_read_message < prev_chat.last_message.id) {

            prev_chat.last_read_message = prev_chat.last_message.id;
            WebSocketInstance.waitForSocketConnection(this, (component) => {
                console.assert(this === component);
                WebSocketInstance.sendMessage({
                    command: 'update_last_read_messages',
                    username: component.props.username,
                    chat_id: prev_chat.id,
                    last_read_message: prev_chat.last_read_message
                });
            });
        }
        this.updateChatsInState([prev_chat, cur_chat]);
        return cur_chat;
    }

    chatChange = (item) => {
        this.props.change_chat(parseInt(item.key), this.doRelevantUpdates(parseInt(item.key)));
    }

    showChats = () => {
        let chats = [...this.state.chats];

        //sorting starts here (radix sort ~ O(50 n))
        let bucket = [];
        for(let j = 0; j < 26; j++){
            bucket[j] = [];
            for(let i = 0; i < 10; i++){
                bucket[j][i] = [];
            }
        }
        for(let j = 25; j >= 0; j--){
            if(j == 4 || j == 7 || j == 10|| j == 13|| j == 16|| j == 19)
                continue;
            for(let i = 1; i < chats.length; i++){
                let idx = 0;
                if(chats[i].last_message.timestamp)
                    idx = chats[i].last_message.timestamp.toString().charAt(j);
                else
                    idx = chats[i].creation_time.toString().charAt(j);
                if(idx > '9' || idx < '0'){
                    continue;
                }
                idx = parseInt(idx);
                bucket[j][idx].push(chats[i]);
            }
            let cnt = 1;
            for(let i = 0; i < 10; i++){
                for(let k = 0; k < bucket[j][i].length; k++){
                    chats[cnt] = bucket[j][i][k];
                    cnt++;
                }
            }
            cnt = 1;
        }
        chats[chats.length] = chats[0];
        chats.reverse();
        chats.pop();
        //sorting ends here

        let chat_items = chats.map((chat, index) => {
            let last_user = 'Type your first message';
            if (chat.last_message.hasOwnProperty('contact')) {
                last_user = chat.last_message.contact.name;
                if (chat.last_message.contact.position === 'Unknown')
                    last_user = chat.last_message.contact.username;
            }
            return (
                <Menu.Item key={chat.id}>
                    <Contact
                        chat={chat}
                        picURL={chat.image}
                        chatName={chat.name}
                        chatTime={chat.last_message.hasOwnProperty('timestamp') && new Date(chat.last_message.timestamp).toLocaleTimeString('en-US')}  // render chat.last_message.timestamp
                        lastMessage={chat.last_message.hasOwnProperty('content') && chat.last_message.content}
                        lastUser={last_user}
                        unreadCount={chat.unread_count}
                        dot={(chat.last_message.contact &&
                            chat.last_message.contact.username === this.props.username &&
                            chat.last_message.id > chat.max_last_read_message)}
                    />
                </Menu.Item>
            );
        });
        return (
            <Menu className="menu" onClick={this.chatChange} selectedKeys={this.props.chat && [this.props.chat.toString()]}>
                {chat_items}
            </Menu>
        );
    }

    getChats = (channelId) => {
        axios
            .get(`${ hostname }/chat/channel/${channelId}/`)
            .then(res => {
                let chats = [...res.data];
                for (let i = 0; i < chats.length; i ++)
                    chats[i].users_typing = [];
                this.setState({chats: chats});
            });
    }

    getChatCopy = (chatId) => {
        for (let i = 0; i < this.state.chats.length; i ++)
            if (this.state.chats[i].id === chatId)
                return {...this.state.chats[i]};
        return {};
    }

    updateChatsInState = (updated_chats, callback = null) => {
        let chats = [...this.state.chats];
        for(let it = 0; it < updated_chats.length; it ++) {
            let chat = updated_chats[it];
            for (let i = 0; i < chats.length; i ++) {
                if (chats[i].id === chat.id) {
                    chats[i] = chat;
                    break;
                }
            }
        }
        this.setState({chats: chats}, callback);
    }

    receiveNewMessage = (parsed_data) => {
        let chat = this.getChatCopy(parsed_data.chat_id);
        if(parsed_data.chat_id !== this.props.chat && parsed_data.content.contact.username !== this.props.username) {
            chat.unread_count ++;
            WebSocketInstance.sendMessage({
                command: 'update_unread_count_in_channel',
                channel_id: parsed_data.channel_id,
                chat_id: parsed_data.chat_id,
                cnt: 1
            }, false);

        }
        if(!chat.id)
            return;
        if(parsed_data.content.contact.username === this.props.username) {
            chat.last_read_message = Math.max(chat.last_read_message, parsed_data.content.id);
            if(chat.participants_count === 1)
                chat.max_last_read_message = Math.max(chat.max_last_read_message, parsed_data.content.id);
        }
        chat.last_message = parsed_data.content;

        let users_typing = [...chat.users_typing];
        for(let i = 0; i < users_typing.length; i ++) {
            if(users_typing[i] === parsed_data.content.contact.username) {
                let left = [];
                if (i) left = users_typing.slice(0, i - 1);
                chat.users_typing = [...left, ...users_typing.slice(i + 1, users_typing.length)];
                break;
            }
        }
        // console.log('UPDATED CHAT: ', chat);
        this.updateChatsInState([chat], () => {
            if(chat.id === this.props.chat)
                this.chatChange({key: this.props.chat});
        });
    }

    userStoppedTyping = (chat_id, username) => {
        let chat = this.getChatCopy(chat_id);
        let users_typing = [...chat.users_typing];
        for(let i = 0; i < users_typing.length; i ++) {
            if(users_typing[i] === username) {
                let left = [];
                if (i) left = users_typing.slice(0, i - 1);
                chat.users_typing = [...left, ...users_typing.slice(i + 1, users_typing.length)];
                break;
            }
        }
        this.updateChatsInState([chat]);
    }

    receiveUserTyping = (parsed_data) => {
        if(parsed_data.username === this.props.username || !this.state.chats.length)
            return;
        let chat = this.getChatCopy(parsed_data.chat_id);
        if(chat.users_typing && !chat.users_typing.includes(parsed_data.username)) {
            chat.users_typing.push(parsed_data.username);
            this.updateChatsInState([chat]);
            setTimeout(() => this.userStoppedTyping(chat.id, parsed_data.username), 4000);
        }
    }

    receiveUpdateMaxLastReadMessage = (parsed_data) => {
        let chat = this.getChatCopy(parsed_data.chat_id);
        if(chat.participants_count === 1 || this.props.username !== parsed_data.username) {
            chat.max_last_read_message = Math.max(chat.max_last_read_message, parsed_data.last_read_message);
            this.updateChatsInState([chat], () => {
                if(chat.id === this.props.chat)
                    this.chatChange({key: this.props.chat});
            });
        }
    }

    receiveUpdatePinnedMessage = (parsed_data) => {
        let chat = this.getChatCopy(parsed_data.chat_id);
        chat.pinned_message = parsed_data.message;
        this.updateChatsInState([chat], () => {
            if(chat.id === this.props.chat)
                this.chatChange({key: this.props.chat});
        });
    }

    receiveUpdateLastActiveTime = (parsed_data) => {
        let chats = [...this.state.chats];
        for (let i = 0; i < chats.length; i ++) {
            let chat = {...chats[i]};
            if(chat.is_private && chat.target_user_contact && chat.target_user_contact.username === parsed_data.username) {
                chat.target_user_contact.last_active_time = parsed_data.timestamp;
                chats[i] = chat;
                this.setState({chats: chats}, () => {
                    if(chat.id === this.props.chat)
                        this.chatChange({key: this.props.chat});
                });
            }
        }
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.auth.token,
        username: state.auth.username,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NameSidepanel));
