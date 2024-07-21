import React from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import * as authActions from "~/store/actions/auth";
import * as navActions from "~/store/actions/nav";
import * as messageActions from "~/store/actions/messages";
import * as KLMSActions from "~/store/actions/KLMS";

import {connect} from "react-redux";
import Contact from "~/helpers/Contact";
import * as userProfileActions from "~/store/actions/userProfile";

class Sidepanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            componentLocation: "/chat"
        };
    }

    waitForAuthDetails() {
        const component = this;
        setTimeout(function() {
            if (component.props.token !== null && component.props.token !== undefined) {
                component.props.getUserChats(component.props.username, component.props.token);
                return;
            } else {
                // component.waitForAuthDetails();  // Recur until we don't authorize
            }
        }, 100);
    }

    componentDidMount() {
        this.waitForAuthDetails();
    }

    openAddChatPopup() {
        this.props.addChat();
    }

    // componentWillReceiveProps(newProps) {
    //     if(newProps.token !== this.props.token) {
    //         this.props.getUserChats(newProps.username, newProps.token);
    //         // this.getUserChats(newProps.token, newProps.username);
    //     }
    // }

    /* getUserChats = (token, username) => {
        // authenticating the request
        axios.defaults.headers = {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
        }
        axios.get(`http://127.0.0.1:8000/chat/?username=${username}`)
            .then(res => {
                this.setState({
                    chats: res.data
                })
            });
    } */

    render() {
        if(!this.props.isAuthenticated) {
            return <Redirect to="/"> </Redirect>
        }
        const activeChats = this.props.chats.map(c => {
            return (
                <Contact
                    key={c.id}
                    name={c.name}
                    username={this.props.username}
                    participants={c.participants}
                    isPrivate={c.is_private}
                    status="online"
                    picURL="https://pbs.twimg.com/profile_images/1243278080979894272/YhBdWQhM_400x400.jpg"
                    // picURL="http://emilcarlsson.se/assets/louislitt.png"
                    chatURL={`${this.state.componentLocation}/${c.id}`} />
            )
        })

        return (
            <div id="sidepanel">
                <div id="profile">
                    <div className="wrap">
                        <img id="profile-img" src="http://localhost:8000/media/item_images/default.jpg" className="online"
                             alt=""/>
                        <p onClick={() => this.props.fetchUserProfile(this.props.token, this.props.username)}>{this.props.username}</p>
                        <i className="fa fa-chevron-down expand-button" aria-hidden="true"></i>
                        <div id="status-options">
                            <ul>
                                <li id="status-online" className="active"><span className="status-circle"></span>
                                    <p>Online</p></li>
                                <li id="status-away"><span className="status-circle"></span> <p>Away</p></li>
                                <li id="status-busy"><span className="status-circle"></span> <p>Busy</p></li>
                                <li id="status-offline"><span className="status-circle"></span> <p>Offline</p></li>
                            </ul>
                        </div>
                        <div id="expanded">
                            {/*<label htmlFor="twitter"><i className="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="mikeross" />
                            <label htmlFor="twitter"><i className="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="ross81" />
                            <label htmlFor="twitter"><i className="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="mike.ross" />*/}
                        </div>
                    </div>
                </div>
                <div id="search">
                    <label htmlFor=""><i className="fa fa-search" aria-hidden="true"></i></label>
                    <input type="text" placeholder="Search contacts..."/>
                </div>
                <div id="contacts">
                    <ul>
                        {activeChats}
                    </ul>
                </div>
                <div id="bottom-bar">
                    <button id="addcontact" onClick={() => this.openAddChatPopup() }><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Add Chat</span>
                    </button>
                    <button id="addcontact" onClick={() => this.props.addKLMS() }><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Sync KLMS</span> </button>
                    <button id="settings" onClick={this.props.logout}><i className="fa fa-cog fa-fw"
                                                                         aria-hidden="true"></i> <span>Log out</span>
                    </button>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        username: state.auth.username,
        chats: state.message.chats
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(authActions.logout()),
        addChat: () => dispatch(navActions.openAddChatPopup()),
        addKLMS: () => dispatch(KLMSActions.openKLMS()),
        getUserChats: (username, token) => dispatch(messageActions.getUserChats(username, token)),
        fetchUserProfile: (token, targetUsername) => dispatch(userProfileActions.fetchUserProfile(token, targetUsername)),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidepanel));
