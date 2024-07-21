import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  showKLMS: false
};

const openKLMS = (state, action) => {
  return updateObject(state, { showKLMS: true });
};

const closeKLMS = (state, action) => {
  return updateObject(state, { showKLMS: false });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "OPEN_KLMS":
      return openKLMS(state, action);
    case "CLOSE_KLMS":
      return closeKLMS(state, action);
    default:
      return state;
  }
};

export default reducer;