import React from "react";
import { NavLink } from 'react-router-dom';

export const displayUserName = (user_object) => {
    if (user_object.position === 'unknown') {
        return user_object.username;
    } else {
        return `${user_object.name} ${user_object.surname}`;
    }
}