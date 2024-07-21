import React from 'react';
// import { homeObjOne } from './Data'
// import { InfoSection } from '../../components';
import {
    Heading, Img, ImgWrapper,
    InfoColumn,
    InfoRow,
    InfoSec, Subtitle,
    TextWrapper,
    Topline
} from "~/pages/home/components/InfoSection/InfoSection.elements";
import {Button, Container} from "~/pages/home/globalStyles";
import '~/styles/css/FormBase.css';

class Wrapper extends React.Component {
    render() {
        return (
            <>
                <InfoSec lightBg = {false}>
                    <Container>
                        <InfoRow imgStart ={''}>
                            <div className={'home-form-container'}>
                                {this.props.render_component}
                            </div>
                            <InfoColumn>
                                <ImgWrapper start={'end'}>
                                    <Img src={this.props.src}/>
                                </ImgWrapper>
                            </InfoColumn>
                        </InfoRow>
                    </Container>
                </InfoSec>
            </>
        );
    }
}

export default Wrapper;