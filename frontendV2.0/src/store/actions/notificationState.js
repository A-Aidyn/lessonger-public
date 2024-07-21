// methods that take place on receiving some actions
import axios from 'axios';
import * as actionTypes from './actionTypes';
import {hostname} from "~/helpers/Consts";


export const notificationStatePending = () => {
    return {
        type: actionTypes.NOTIFICATION_STATE_PENDING,
        notificationState: 0,
    }
}

export const notificationStateChosen = () => {
    return {
        type: actionTypes.NOTIFICATION_STATE_CHOSEN,
        notificationState: 1,
    }
}

export const setNotificationState = () => {
    return dispatch => {
        dispatch(notificationStateChosen());
    }
}
