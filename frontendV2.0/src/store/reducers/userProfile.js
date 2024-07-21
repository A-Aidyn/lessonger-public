import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  showUserProfilePopup: false,
  targetUsername: "",
  targetUserInfo: {}
};

const openUserProfilePopup = (state, action) => {
  return updateObject(state, {
      showUserProfilePopup: true,
      targetUsername: action.targetUsername,
      targetUserInfo: action.targetUserInfo
  });
};

const closeUserProfilePopup = (state, action) => {
  return updateObject(state, { showUserProfilePopup: false });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_USER_PROFILE_POPUP:
      return openUserProfilePopup(state, action);
    case actionTypes.CLOSE_USER_PROFILE_POPUP:
      return closeUserProfilePopup(state, action);
    default:
      return state;
  }
};

export default reducer;