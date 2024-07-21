import styled from 'styled-components';
import {FaStudiovinari} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import {Container} from '../../globalStyles';



export const Nav = styled.nav`
background: #61B7E6;
height: 80px;
display:flex;
justify-content:center;
align-items:center;
font-size:1.2rem;
position:sticky;
top:0;
z-index:999;
`

export const  NavbarContainer = styled(Container)`
display: flex;
justify-content:space-between;
height:80px;

${Container}

`;
export const Mytext=styled.text`
 color:#ff4081;
 align-self:center;
 margin-left:20px;
 font-weight:bold;
 font-family: 'Source Sans Pro', sans-serif;
 font-size:20px;

 

 @media screen and (max-width:960px){
     padding-right:100px;

 }
 @media screen and (max-width:740px){
     
     display:none;
 }
`


export const NavLogo =styled(Link)` 
color:#ffffff;
justify-self:flex-start;
cursor: pointer;
text-decoration: none;
font-size: 2rem;
display: flex;
align-items:center;
&:hover {
    color:#4b59f7;
    transition:all 0.3s ease;
}
`

export const NavIcon =styled(FaStudiovinari) ` //FaMagento
margin-right:0.5rem;
`
export const Logo = styled.img `
width:30px;
height:30px;
margin-right:0.5rem;

`



export const MobileIcon = styled.div`
display:none;

@media screen and (max-width:960px){
    display:block;
    position:absolute;
    top:0;
    right:0;
    transform: translate(-100%,60%);
    font-size: 1.8rem;
    cursor: pointer;

}
`;

export const NavMenu = styled.ul`
display:flex;
align-items:center;
list-style:none;
text-align:center;
margin: 0;
  
@media screen and (max-width: 960px) {
    display:flex;
    flex-direction: column;
    width:100%;
    height:90vh;
    position: absolute;
    top:80px;
    left: ${({click}) => (click? 0 :'-100%')}; 
    opacity:1;
    transition: all 0.5s ease;
    background: #101522;

}
`;

export const NavItem = styled.li `
height:80px;
border-bottom: 2px solid transparent;

&:hover {
    border-bottom: 2px solid #4b59f7;
}

@media screen and (max-width: 960px){
    width: 100%;
    &:hover {
        border:none;
    }
}
`;

export const NavLinks =styled(Link)`
color:#fff;
display:flex;
align-items:center;
text-decoration:none;
padding: 0.5rem 1rem;
height: 100%;
line-height: normal;
&:hover {
    color:#4b59f7;
    transition:all 0.3s ease;
}

@media screen and (max-width:960px){
    text-align:center;
    padding: 2rem;
    width:100%;
    display:table;

    &:hover {
        color:#4b59f7;
        transition:all 0.3s ease;
    }
}
  
`

export const  NavItemBtn =styled.li `
@media  screen and (max-width:960px){
    display: flex;
    justify-content:center;
    align-items:center;
    width:100%;
    height:120px;
}
`

export const NavBtnLink =styled(Link) `
display:flex;
justify-content:center;
align-items:center;
text-decoration:none;
padding: 8px 16px;
height: 100%;
width:100%;
border:none;
outline:none;
`;


