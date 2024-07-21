import React from "react";
import { NavLink } from 'react-router-dom';

const getChatName = (props) => {
    if (props.isPrivate && props.participants.length == 2) {
        if(props.participants[0] == props.username)
            return props.participants[1]
        return props.participants[0]
    } else {
        return props.name
    }
}

const Contact = (props) => (
    <NavLink to={`${props.chatURL}`} style={{color: '#fff'}}>
        <li className="contact">
            <div className="wrap">
                <span className="contact-status online"></span>
                <img src={props.picURL} alt=""/>
                <div className="meta">
                    <p className="name"> {getChatName(props)} </p>
                    {/*<p className="preview">You just got LITT up, Mike.</p>*/}
                </div>
            </div>
        </li>
    </NavLink>
)

export default Contact;