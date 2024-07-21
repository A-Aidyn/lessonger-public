import React from "react";
import { NavLink } from 'react-router-dom';

export const getChatName = (chat, short=false) => {
    if (!chat.is_channel_course || chat.is_private)
        return chat.name;
    let name = '';
    if(short) {
        name = `${chat.course_code} General Chat`;
        if (chat.section !== '0')
            name = `${chat.course_code} Section ${chat.section} Chat`;
    } else {
        name = `${chat.name} General Chat`;
        if (chat.section !== '0')
            name = `${chat.name} Section ${chat.section} Chat`;
    }
    return name;
}