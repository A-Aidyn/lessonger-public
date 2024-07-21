import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import thunk from "redux-thunk";
import { Provider } from 'react-redux';

import authReducer from './store/reducers/auth';
import notificationStateReducer from './store/reducers/notificationState';
import navReducer from './store/reducers/nav';
import messageReducer from './store/reducers/messages';
import joinChatReducer from './store/reducers/joinChat';
import userProfileReducer from './store/reducers/userProfile';
import KLMSReducer from './store/reducers/KLMS';

const composeEnhances = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
    auth: authReducer,
    notificationState: notificationStateReducer,
    message: messageReducer,
    nav: navReducer,
    joinChat: joinChatReducer,
    userProfile: userProfileReducer,
    KLMS: KLMSReducer,
});

// Redux store
const store = createStore(
                rootReducer,
                composeEnhances(applyMiddleware(thunk)) // enhancer is needed to handle middleware of the application
                );

// <Provider /> component is needed to specify which store are we using for child components
const app = (
    <Provider store={store}>
        <App />
    </Provider>
);


ReactDOM.render(app, document.getElementById('root'));