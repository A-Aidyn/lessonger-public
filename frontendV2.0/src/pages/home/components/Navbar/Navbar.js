import React, {useState,useEffect} from 'react';
import {FaBars,FaTimes} from 'react-icons/fa';
import {IconContext} from 'react-icons/lib';
import { Button } from '../../globalStyles';



import {
    Nav,
    NavbarContainer,
    NavLogo,
   
    MobileIcon,
    NavMenu,
    NavItem,
    NavLinks,
    NavItemBtn,
    NavBtnLink,
    Logo,
    Mytext
    
} from './Navbar.elements';
import {connect} from "react-redux";


const Navbar = (props) => {
    const [click,setClick] =useState(false)
    const [button,setButton] =useState(true)

    const handleClick = () => setClick(!click)
    const closeMobileMenu = () => setClick(false)


    const showButton = () =>{
        if(window.innerWidth <= 960 ) {
            setButton(false)
        } else{
            setButton(true)
        }
    }
    useEffect(() => {
        showButton()
    },[])

    window.addEventListener('resize',showButton);
    return (
        <>
            <IconContext.Provider value={{color: '#fff'}}>
                <Nav>
                    <NavbarContainer>
                        <NavLogo to="/" onClick={closeMobileMenu} >
                            <Logo src='https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/item_images/logo-revised.svg' />
                            Lessonger      
                        </NavLogo>
                        <MobileIcon onClick={handleClick}>
                            {click ? <FaTimes/> :<FaBars/>}
                        </MobileIcon>
                        <NavMenu onClick={handleClick} click={click}>
                            <NavItem>
                                <NavLinks to='/'>
                                    Home
                                </NavLinks>
                            </NavItem>
                            {
                                !props.isAuthenticated
                                    ?
                                    <>
                                        <NavItem>
                                            <NavLinks to='/login'>
                                                Login
                                            </NavLinks>
                                        </NavItem>
                                        <NavItemBtn>
                                            { button ? (
                                                <NavBtnLink to="/signup">
                                                    <Button primary>SIGN UP</Button>
                                                </NavBtnLink>
                                            ): (
                                                <NavBtnLink to="/signup">
                                                    <Button  fontBig primary>
                                                        SIGN UP
                                                    </Button>
                                                </NavBtnLink >
                                            )}
                                        </NavItemBtn>
                                    </>
                                    :
                                    <NavItemBtn>
                                        { button ? (
                                            <NavBtnLink to="/new-chat">
                                                <Button primary>CHAT</Button>
                                            </NavBtnLink>
                                        ): (
                                            <NavBtnLink to="/new-chat">
                                                <Button  fontBig primary>
                                                    CHAT
                                                </Button>
                                            </NavBtnLink >
                                        )}
                                    </NavItemBtn>
                            }

                        </NavMenu>
                    </NavbarContainer>

                </Nav>
            </IconContext.Provider>
        </>
    )
}

export default Navbar;
