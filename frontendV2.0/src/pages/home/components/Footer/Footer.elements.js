import styled from 'styled-components'
import {Link} from 'react-router-dom'
import { FaMagento } from 'react-icons/fa';


export const FooterContainer = styled.div `
background-color:#101522;
padding: 4rem 0 2rem 0;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
`;


export const FooterSubscription =styled.section `
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
margin-bottom:24px;
padding:24px;
color:#fff;
`;

export const FooterSubHeading =styled.p `
font-family: 'Trebuchet MS', 'Lucida Sans Unicode','Lucida Grande','Lucida Sans',Arial , sans-serif;
margin-bottom:24px;
font-size:24px;
`;

export const FooterSubText =styled.p `
margin-bottom:24px;
font-size:20px;

`
export const Form =styled.form `
display:flex;
justify-content:center;
align-items:center;
@media screen and (max-width:820px){
    flex-direction:column;
    width: 80%;

}
`;
export const Logo = styled.img `
width:40px;
height:25px;
margin-right:0.5rem;

`

export const FormInput =styled.textarea `
padding:10px 20px;
border-radius:2px;
margin-right:10px;

height:5rem;
outline:none;
//border:none;
font-size:16px;
color: black;
border: 1px solid #fff;
&:place-holder {
    color:#242424;
}

@media screen and (max-width: 820px){
    width:100%;
    margin:0 0 16px 0;
}
`;

export const FooterLinksContainer =styled.div `
width:100%;
max-width:1000px;
display:flex;
justify-content:center;

@media screen and (max-width: 820px){
    padding-top: 32px;
}
`;

export const FooterLinksWrapper =styled.div `
display: flex;

@media screen and (max-width: 820px){
    flex-direction:column;

}
`

export const FooterLinksItems =styled.div `
display:flex;
flex-direction:column;
align-items:flex-start;
margin:16px;
text-align:left;
width:160px;
box-sizing:border-box;
color:#fff;

@media screen and (max-width:420px){
    margin: 0;
    padding: 10px;
    width: 100%;
}
`

export const FooterLinkTitle = styled.h2 `
margin-bottom: 16px;
`

export const FooterLink =styled(Link) ` 
color:#fff;
text-decoration:none;
margin-bottom:0.5rem;
&:hover{
    color:#0467fb;
    transition:0.3s ease-out;
}

`;


export const SocialMedia = styled.section ` 
max-width:1000px;
width:100%;
`
export const SocialMediaWrap =styled.div `
display:flex;
justify-content:space-between;
align-items:center;
width:90%;
max-width:1000px;
margin: 40px auto 0 auto;

@media screen and (max-width: 820px) {
    flex-direction:column;
}
`
export const SocialLogo =styled(Link)` 
color:#fff;
justify-self:start;
cursor:pointer;
text-decoration:none;
font-size:2rem;
display:flex;
align-items:center;
margin-bottom:16px;

`

export const SocialIcon = styled(FaMagento)`
    margin-right:10px;
` 
export const WebsiteRights = styled.small `
color:#fff;
margin-bottom:16px;
`

export const SocialIcons = styled.div `
display: flex;
justify-content: space-between;
align-items: center;
width:240px;

`;
 export const SocialIconLink =styled.a ` 
  color:#fff;
  font-size:24px;
 `
 export const MyButton =styled.button `
 align-self:flex-start;
 border-radius: 4px;
 background: ${({primary}) => (primary? '#1F00B0' : '#0467FB')};
 white-space: nowrap;
 padding: ${({big}) => (big? '12px 64px' : '10px 20px')};
 color:#fff;
 font-size:${({fontBig}) =>(fontBig ? '20px ': '16px')};
 outline:none;
 border:none;
 cursor: pointer;
 
 &:hover {
     transition: all 0.3s ease-out;
     background:#fff;
     background: ${({primary}) => (primary? 'rgba(31, 0, 176, 0.13)' : '#4B59F7')};
     
 }
 
 @media screen and (max-width:960px){
     width:100%;
 }
 
 `;

