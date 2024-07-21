import React from "react";
import { Space, Button, Layout, Menu, Typography, Avatar, Badge, Spin, Popover, Tooltip, Icon } from 'antd';
import {LoadingOutlined, RedoOutlined, UploadOutlined, UserOutlined, CloudSyncOutlined} from '@ant-design/icons';
//import Logo from "~/media/2219720.png";
import axios from "axios";
import { hostname } from "~/helpers/Consts";
import { connect } from "react-redux";
import UserProfileIcon from "~/media/3643751-craft-go-paper-plane-send-start_113443.svg";
import SyncIcon from "~/media/download_arrow_icon_143023.svg";
import Logo from "~/media/logo-revised-white.svg";
import "~/styles/css/IconSidepanel.css";
import WebSocketInstance from "~/websocket";

const { Header, Sider } = Layout;
const { Text, Title } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


class IconSidepanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initial_setup: (props.channel !== 0),
            channels: [],
            channel: -1,
            title_status: 0,
            notified_chats: [],
        };
        this.channelsContainerRef = React.createRef();
        this.audio = new Audio('https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/new_message_sound.mp3');
        console.log("[NewChatIconSidepanel] constructor is called!");
    }

    render() {
        if(this.state.title_status)
            document.title = `(${this.state.notified_chats.length}) new notifications | Lessonger`;
        else
            document.title = 'Chat | Lessonger';

        // Update icon accordingly!
        const favicon = document.getElementById('favicon');
        if(this.state.notified_chats.length)
            favicon.href = 'https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/logo-revised-white-badge.svg';
        else
            favicon.href = 'https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/logo-revised.svg';

        return (
            <Sider className="chat-layout-icon-sidepanel" defaultCollapsed="true" collapsedWidth={"70px"} theme={"light"}>
                <Header className="chat-layout-icon-sidepanel-header">
                    <Logo width={35} height={35} />
                </Header>
                {
                    this.state.channels.length
                        ?
                        <div className="icon-list" ref={this.channelsContainerRef}>
                            <>
                            {
                                this.state.channels.map((channel, index) => {
                                    let title = 'Your Channel';
                                    let inner = (<UserProfileIcon width={30} height={30}/>);
                                    if (channel.is_course) {
                                        title = `${channel.name} (${channel.code})`;
                                        inner = (
                                            <div className={'text'}>
                                                <span> {channel.code.slice(0, -3)} </span>
                                                <span> {channel.code.slice(-3)} </span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <Tooltip key={channel.id} placement={'right'} title={title}>
                                            <div className={'icon-list-item'}>
                                                <Badge
                                                    // size={'small'}
                                                    style={{height: 8, width: 8}}
                                                    dot={channel.unread_count}
                                                    offset={[-6, 4]}
                                                >
                                                    <div id={channel.id} className={'rounded-background'} onClick={(e) => this.channelChange(e.target)}>
                                                        {inner}
                                                    </div>
                                                </Badge>
                                            </div>
                                        </Tooltip>
                                    );
                                })
                            }
                            {
                                <Tooltip key={0} placement={'right'} title={'Fetch courses and profile'}>
                                    <div className={'icon-list-item'} >
                                        <div id={0} className={'rounded-background'} onClick={(e) => this.channelChange(e.target)}>
                                            <SyncIcon/>
                                        </div>
                                    </div>
                                </Tooltip>
                            }
                            </>
                        </div>
                        :
                        <Spin indicator={antIcon} />
                }

            </Sider>
        )
    }

    componentDidMount() {
        if (!this.state.channels.length)
            this.getChannels();
        this._isMounted = true;
        WebSocketInstance.addCallbacks(
            {
                'update_unread_count_in_channel': this.receiveUpdateUnreadCountInChannel,
            }
        );
    }

    componentWillUnmount() {
        if(this.state.interval_id) {
            clearInterval(this.state.interval_id);
            this.setState({interval_id: null, title_status: 0});
        }
        this._isMounted = false;
        WebSocketInstance.removeCallbacks(
            {
                'update_unread_count_in_channel': this.receiveUpdateUnreadCountInChannel,
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.initial_setup && this.state.channels.length) {
            this.channelChange(this.getChannelHtmlById(this.props.channel));
            this.setState({ initial_setup: false });
        }
        if(this.state.notified_chats.length && !this.state.interval_id) {
            let interval_id = setInterval(this.titleNotification, 2000);
            this.setState({interval_id: interval_id, title_status: 1});
        }
        if(!this.state.notified_chats.length && this.state.interval_id) {
            clearInterval(this.state.interval_id);
            this.setState({interval_id: null, title_status: 0});
        }
    }

    titleNotification = () => {
        this.setState((state) => ({title_status: !state.title_status}));
    }

    fetchCoursesNProfile = () => {
        axios.get(`${ hostname }/chat/sync/`)
            .then(res => {
                window.location.replace(res.data);
            })
            .catch(err => {
            });
    }

    getChannels = () => {
        axios
            .get(`${hostname}/chat/channel/`)
            .then(res => {
                this.setState({ channels: res.data });
            });
    }

    channelChange = (e) => {
        // console.log(e);
        let id = parseInt(e.id);
        if(id === 0) {
            this.fetchCoursesNProfile();
            return;
        }
        if(this.state.channel !== -1) {
            let channel_target = this.getChannelHtmlById(this.state.channel);
            console.log(channel_target);
            channel_target.classList.remove('rounded-background-clicked');
        }

        this.setState({channel: id}, () => {
            e.classList.add('rounded-background-clicked');
            for (let i = 0; i < this.state.channels.length; i++) {
                if (this.state.channels[i].id === id) {
                    // console.log(this.state.channels[i]);
                    this.props.change_channel(this.state.channel, this.state.channels[i]);
                    break;
                }
            }
        });
    }

    getChannelHtmlById = (channelID) => {
        let target = this.channelsContainerRef.current;
        console.log(target);
        for (let i = 0; i < target.children.length; i++)
            if (parseInt(target.children[i].firstChild.firstChild.id) === channelID) // TODO: change this when html changes
                return target.children[i].firstChild.firstChild;
        return null;
    }

    receiveUpdateUnreadCountInChannel = (parsed_data) => {
        console.log('received unread count, parsed_data: ', parsed_data);
        let chatId = parsed_data.chat_id;

        if(parsed_data.cnt > 0) { // new message
            if(!this.state.notified_chats.includes(parsed_data.chat_id)) {
                this.audio.play();
                this.setState((state) => ({
                    notified_chats: [...state.notified_chats, parsed_data.chat_id]
                }));
            }
        } else { // choosing a chat
            if(this.state.notified_chats.includes(chatId)) {
                let tmp = [...this.state.notified_chats];
                tmp.splice(tmp.indexOf(chatId), 1);
                this.setState({notified_chats: tmp});
            }
        }

        let channels = [...this.state.channels];
        for(let i = 0; i < channels.length; i ++) {
            let channel = {...channels[i]};
            if(channel.id === parsed_data.channel_id) {
                channel.unread_count += parsed_data.cnt;
                channels[i] = channel;
                this.setState({channels: channels});
                break;
            }
        }
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.auth.token,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IconSidepanel);