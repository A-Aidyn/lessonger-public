import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  messages: [],
  chats: [],
  waiting: false,
  moreMessages: 1
};

const addMessage = (state, action) => {
  return updateObject(state, {
    messages: [...state.messages, action.message]
  });
};

const waitingForOldMessages = (state, action) => {
  return updateObject(state, {
    waiting: action.waiting
  });
};

const loadOldMessages = (state, action) => {
  // const messages = [...state.messages];
  // messages.reverse();
  action.messages.reverse();
  const combined_messages = [...action.messages, ...state.messages];
  return updateObject(state, {
    messages: combined_messages,
    waiting: action.waiting,
    moreMessages: Math.min(1, action.messages.length)
  });
}

const setMessages = (state, action) => {
  return updateObject(state, {
    messages: action.messages.reverse(),
    moreMessages: action.moreMessages
  });
};

const setChats = (state, action) => {
  return updateObject(state, {
    chats: action.chats
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_MESSAGE:
      return addMessage(state, action);
    case actionTypes.WAITING_FOR_OLD_MESSAGES:
      return waitingForOldMessages(state, action);
    case actionTypes.LOAD_OLD_MESSAGES:
      return loadOldMessages(state, action);
    case actionTypes.SET_MESSAGES:
      return setMessages(state, action);
    case actionTypes.GET_CHATS_SUCCESS:
      return setChats(state, action);
    default:
      return state;
  }
};

export default reducer;
