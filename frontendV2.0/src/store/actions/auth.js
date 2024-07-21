// methods that take place on receiving some actions
import axios from 'axios';
import * as actionTypes from './actionTypes';
import {hostname} from "~/helpers/Consts";


export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

// In order to have a successful login we are going to need a token (as a parameter and as a return parameter)
export const authSuccess = (token, username) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        username: username
    }
}

export const authFail = error => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('expirationDate');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000)
    }
}

export const authSignup = (username, email, password1, password2) => {
    return dispatch => {
        dispatch(authStart()); // A call to action. Dispatch of the authStart. Tell us that authStart has taken place
        const proxyurl = ""; // "https://rocky-sands-85804.herokuapp.com/";
        const url = `${hostname}/rest-auth/registration/`;
        axios.post(proxyurl + url, {
            username: username,
            email: email,
            password1: password1,
            password2: password2
        }).then(res => {
            const token = null;
            const expirationDate = new Date(new Date().getTime + 3600 * 1000);
            // localStorage.setItem('token', token);
            // localStorage.setItem('username', username);
            // localStorage.setItem('expirationDate', expirationDate);
            dispatch(authSuccess(token, username));
            dispatch(checkAuthTimeout(3600)); // 3600 seconds
        }).catch(err => {
            dispatch(authFail(err))
        });
    }
}

export const authLogin = (username, password, remember) => {
    return dispatch => {
        dispatch(authStart()); // A call to action. Dispatch of the authStart. Tell us that authStart has taken place
        const proxyurl = ""; // "https://rocky-sands-85804.herokuapp.com/";
        const url = `${hostname}/rest-auth/login/`;
        axios.post(proxyurl + url, {
            username: username,
            password: password
        }).then(res => { // In the response we are getting back a key
            const token = res.data.key;
            // expiration time is one hour
            let expirationDate;
            if (remember) {
                expirationDate = new Date(new Date().getTime() + 3600 * 1000*24*30*12*2);
            } else{
                expirationDate = new Date(new Date().getTime() + 3600 * 1000);
            }
            
            // We are storing token and expirationDate in local storage of the browser
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            localStorage.setItem('expirationDate', expirationDate.toString());

            dispatch(authSuccess(token, username));
            dispatch(checkAuthTimeout(3600)); // 3600 seconds
        }).catch(err => {
            dispatch(authFail(err))
        });
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token === undefined) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                dispatch(authSuccess(token, username));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ) );
            }
        }
    }
}