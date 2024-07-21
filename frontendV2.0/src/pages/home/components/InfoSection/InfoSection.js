import React from 'react';
import { Container,Button } from '../../globalStyles';
import{Link} from 'react-router-dom';

import {
    InfoSec,
    InfoColumn,
    InfoRow,
    TextWrapper,
    Topline,
    Heading,
    Subtitle,
    ImgWrapper,
    Img
    
 } from './InfoSection.elements';
import {connect} from "react-redux";

const InfoSection = ({
    
    primary,
    lightBg,
    imgStart,
    lightTopLine,
    lightText,
    lightTextDesc,
    buttonLabel,
    desciption,
    headline,
    topline,
    start,
    isAuthenticated
                     }) => {
    
    return (
        <>
            <InfoSec lightBg = {lightBg}> 
                <Container>
                    <InfoRow imgStart ={imgStart}>
                        <InfoColumn>
                            <TextWrapper>
                                <Topline lightTopLine ={lightTopLine}>{topline}</Topline>
                                <Heading lightText={lightText}>{headline}</Heading>
                                <Subtitle lightTextDesc = {lightTextDesc}>{desciption}</Subtitle>
                                <Link to={ !isAuthenticated ? '/signup' : '/new-chat'}>
                                    <Button big fontBig primary={primary}>
                                        {buttonLabel}
                                    </Button>
                                </Link>
                            </TextWrapper>
                        </InfoColumn>
                        <InfoColumn>
                            <ImgWrapper start={start}>
                                <Img src='https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/item_images/chat-10.svg'/>
                            </ImgWrapper>
                        </InfoColumn>
                    </InfoRow>
                </Container>
            </InfoSec>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.token !== null,
        username: state.auth.username
    }
}

export default connect(mapStateToProps)(InfoSection);
