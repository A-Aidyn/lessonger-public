import React, {useState, useRef} from 'react'
import { FaFacebook,FaInstagram,FaYoutube,FaTwitter,FaLinkedin } from 'react-icons/fa';
import axios from "axios";
import {Alert, notification} from 'antd';

import {
    FooterContainer,
   
    FooterSubscription,
    FooterSubText,
    Form,
    FormInput,
    
    SocialMedia,
    SocialMediaWrap,
    SocialIcons,
    SocialIconLink,
    SocialLogo,
    WebsiteRights,
    Logo,
    MyButton
    } from './Footer.elements';
import {hostname} from "~/helpers/Consts";



const Footer = () => {
    const [content, setContent] = useState('');

    const openNotification = () => {
        const args = {
            message: 'Thank you!',
            description:
              "We'll review your feedback shortly",
            duration: 3,
        };
        notification.open(args);
    };

    const sendFeedback = (e) => {
        e.preventDefault();
        axios.post(`${hostname}/feedback/create/`, {
            content: content,
        }).then(
            (res) => {
                openNotification();
            }
        );
        setContent('');
    }

    return (
        <FooterContainer>
            <FooterSubscription>
                <FooterSubText>
                Please Leave Us Your Feedback!
                </FooterSubText> 
                <Form>
                    <FormInput name="text" type="text" placeholder="Your Feedback" onChange={e => setContent(e.target.value)} value={content}/>
                    <MyButton fontBig onClick={(e) => sendFeedback(e)}>Send</MyButton>
                </Form>
            </FooterSubscription> 
            <SocialMedia>
                <SocialMediaWrap>
                    <SocialLogo to="/">
                        <Logo src='https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/item_images/logo-revised.svg'/>
                        Lessonger
                    </SocialLogo>
                    <WebsiteRights>Lessonger &copy; 2021</WebsiteRights>
                    <SocialIcons>
                        <SocialIconLink href='https://www.facebook.com/nurlykhan.kopenov.3' target="_blank" aria-label="Facebook">
                            <FaFacebook/>
                        </SocialIconLink>
                        <SocialIconLink href='https://www.instagram.com/khan_nur02/' target="_blank" aria-label="Instagram">
                            <FaInstagram/>
                        </SocialIconLink>
                        <SocialIconLink href='https://www.youtube.com/channel/UC4SL6f9sAo5akUduZcSO66A' target="_blank" aria-label="Youtube">
                            <FaYoutube/>
                        </SocialIconLink>
                        <SocialIconLink href='https://twitter.com/Nurlykhan10' target="_blank" aria-label="Twitter">
                            <FaTwitter/>
                        </SocialIconLink>
                        <SocialIconLink href='https://www.linkedin.com/in/nurlykhan-kopenov-1467831a2/' target="_blank" aria-label="Linkedin">
                            <FaLinkedin/>
                        </SocialIconLink>
                    </SocialIcons>
                </SocialMediaWrap>
            </SocialMedia>
        </FooterContainer>
    )
}

export default Footer
