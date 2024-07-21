// Will handle fetching the messages from the server
import axios from "axios";
import * as actionTypes from "./actionTypes";
import {hostname} from "~/helpers/Consts";


export const addMessage = message => {
  return {
    type: actionTypes.ADD_MESSAGE,
    message: message
  };
};

export const waitingForOldMessages = () => {
  return {
    type: actionTypes.WAITING_FOR_OLD_MESSAGES,
    waiting: true,
    moreMessages: 1
  }
}

export const loadOldMessages = messages => {
  return {
    type: actionTypes.LOAD_OLD_MESSAGES,
    messages: messages,
    waiting: false,
    moreMessages: 1
  }
}

export const setMessages = messages => {
  return {
    type: actionTypes.SET_MESSAGES,
    messages: messages,
    moreMessages: 1
  };
};

const getUserChatsSuccess = chats => {
  return {
    type: actionTypes.GET_CHATS_SUCCESS,
    chats: chats
  };
};

export const getUserChats = (username, token) => {
  return dispatch => {
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    };
    axios
      .get(`${hostname}/chat/`)
      .then(res => dispatch(getUserChatsSuccess(res.data)));
  };
};
