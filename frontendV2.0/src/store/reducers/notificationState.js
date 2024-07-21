import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

// initial state of the entire application
const initialState = {
    notificationState: 0
}

const notificationStatePending = (state, action) => {
    return updateObject(state, {
        notificationState: 0
    });
}

const notificationStateChosen = (state, action) => {
    return updateObject(state, {
        notificationState: 1
    });
}

const reducer = (state=initialState, action) => {
    switch(action.type) {
        case actionTypes.NOTIFICATION_STATE_PENDING:
            return notificationStatePending();
        case actionTypes.NOTIFICATION_STATE_CHOSEN:
            return notificationStateChosen();
        default:
            return state;
    }
}

export default reducer;