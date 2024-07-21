// This will handle displaying/closing the JOIN CHAT popup
import * as actionTypes from "./actionTypes";

export const openJoinChatPopup = () => {
  return {
    type: actionTypes.OPEN_JOIN_CHAT_POPUP
  };
};

export const closeJoinChatPopup = () => {
  return {
    type: actionTypes.CLOSE_JOIN_CHAT_POPUP
  };
};
