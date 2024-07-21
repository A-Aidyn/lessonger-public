// This will handle displaying/closing the JOIN CHAT popup
import * as actionTypes from "./actionTypes";
import axios from "axios";
import {authFail, authStart, authSuccess, checkAuthTimeout} from "./auth";
import {hostname} from "~/helpers/Consts";

export const openUserProfilePopup = (targetUsername, targetUserInfo) => {
  return {
      type: actionTypes.OPEN_USER_PROFILE_POPUP,
      targetUsername: targetUsername,
      targetUserInfo: targetUserInfo,
  };
};

export const closeUserProfilePopup = () => {
  return {
    type: actionTypes.CLOSE_USER_PROFILE_POPUP
  };
};

export const fetchUserProfile = (token, targetUsername) => {
    return dispatch => {
        const url = `${hostname}/user-profile/${targetUsername}/`; // URL to user info API
        axios.defaults.headers = {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        };
        axios.get(url).then(res => { // In the response we are getting back a key
            dispatch(openUserProfilePopup(targetUsername, res.data));
        }).catch(err => {
            // dispatch(openUserProfileError(err);
        });
    }
}
