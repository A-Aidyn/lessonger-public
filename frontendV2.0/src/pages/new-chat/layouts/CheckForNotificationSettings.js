import React from 'react';
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import {connect} from "react-redux";
import { Layout, Typography} from 'antd';
import { hostname } from "~/helpers/Consts";
import '~/styles/css/NewChat.css';
import CrossIcon from "~/media/1485969927-6-cross_78905.svg";
import {urlBase64ToUint8Array} from "~/helpers/UrlBase64ToUint8Array";
import axios from "axios";
import * as actions from '~/store/actions/notificationState';

const {Footer} = Layout;
const {Text} = Typography;


class CheckForNotificationSettings extends React.Component {

    constructor(props) {
        super(props);
        console.log("[CheckForNotificationSettings] constructor");
        this._isMounted = false;
        this.state = {
            configured: false
        }
        this.registerServiceWorker();
    }

    render () {
        if (!('serviceWorker' in navigator)) {
          // Service Worker isn't supported on this browser, disable or hide UI.
          return null;
        }

        if (!('PushManager' in window)) {
          // Push isn't supported on this browser, disable or hide UI.
          return null;
        }

        if(Notification.permission !== 'default' || this.props.configured)
            return null;
        return (
            <Footer className={'notification-info'}>
                <Text className={'text'}>
                    <Text className={'clickable'} underline onClick={this.askPermission}>Turn on browser notifications</Text> and stay tuned on new message updates
                </Text>
                <CrossIcon className={'cross-icon'} fill={'white'} width={20} height={20} onClick={() => this.props.setNotificationState()}/>
            </Footer>
        )
    }

    componentDidMount() {
        this._isMounted = true;
        console.log('[CheckForNotificationSettings] DID MOUNT!!!');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        this._isMounted = false;
        console.log("[CheckForNotificationSettings] willUnmount");
    }

    registerServiceWorker = () => {
      return navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('Service worker successfully registered.');
            return registration;
          })
          .catch(function(err) {
            console.error('Unable to register service worker.', err);
          });
    }

    askPermission = () => {
      let component = this;
      return new Promise(function(resolve, reject) {
        const permissionResult = Notification.requestPermission(function(result) {
          resolve(result);
        });

        if (permissionResult) {
          permissionResult.then(resolve, reject);
        }
      })
      .then(function(permissionResult) {
        if(permissionResult !== 'default')
            component.props.setNotificationState();
        if (permissionResult !== 'granted')
          throw new Error('We weren\'t granted permission.');
        component.subscribeUserToPush();
      });
    }

    subscribeUserToPush = () => {
      let component = this;
      return navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            const subscribeOptions = {
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                'BDaAqHjFJvY7CeZNix5qkDFF49fkWkBHA263uYZW0wFEqoGMMFDEV72aUr4-9yZxSXmEd35B9uPIdehW7-q7uIg'
              )
            };
            return registration.pushManager.subscribe(subscribeOptions);
          })
          .then(function(pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return component.sendSubscriptionToBackEnd(pushSubscription);
          })
          .catch(err => {
              console.log('subscribing error!', err);
          });
    }

    sendSubscriptionToBackEnd = (subscription) => {
        axios.post(`${hostname}/push-notifications/subscribe/`, {
            payload: JSON.stringify(subscription)
        })
            .then(res => {
                console.log('Data from backend: ', res);
                return res;
            })
            .catch(err => {
                console.log('Received error from backend!: ', err);
            });
    }
}

const mapStateToProps = (state) => {
    return {
        configured: state.notificationState.notificationState,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setNotificationState: () => dispatch(actions.setNotificationState())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CheckForNotificationSettings));