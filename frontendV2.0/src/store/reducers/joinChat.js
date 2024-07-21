import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  showJoinChatPopup: false
};

const openJoinChatPopup = (state, action) => {
  return updateObject(state, { showJoinChatPopup: true });
};

const closeJoinChatPopup = (state, action) => {
  return updateObject(state, { showJoinChatPopup: false });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_JOIN_CHAT_POPUP:
      return openJoinChatPopup(state, action);
    case actionTypes.CLOSE_JOIN_CHAT_POPUP:
      return closeJoinChatPopup(state, action);
    default:
      return state;
  }
};

export default reducer;