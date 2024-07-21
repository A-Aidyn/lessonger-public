
import { connect } from 'react-redux';
import { withRouter} from 'react-router-dom';
import React from 'react';
import GlobalStyle from './globalStyles';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {Navbar,Footer} from './components';
import Home from './pages/HomePage/Home'

import ScrollToTop from './components/ScrollToTop';
import NewChat from "~/pages/new-chat/NewChat";
import Chat from "~/pages/chat/Chat";
import VerifyAfterSignup from "~/pages/verify/Verify";
// import PasswordReset from "~/pages/verify/PasswordReset";
import Wrapper from "./pages/Wrapper/Wrapper";

import Login from "~/pages/login/Login";
import Signup from "~/pages/signup/Signup";
import PasswordReset from "~/pages/verify/PasswordReset";


class HomePage extends React.Component {
    render() {
        const LoginWrapper = <Wrapper render_component={<Login/>} src='https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/item_images/chat-9.svg'/>
        const SignupWrapper = <Wrapper render_component={<Signup/>} src = 'https://s3-back-store.s3.ap-northeast-2.amazonaws.com/media/item_images/chat-3.svg'/>
        const PasswordWrapper = <Wrapper render_component={<PasswordReset/>}/>
        console.log('HOME PAGE RENDER!!!');
        return (
            <>
                <GlobalStyle/>
                <ScrollToTop/>
                <Navbar isAuthenticated={this.props.isAuthenticated}/>
                <Switch>
                    <Route path="/login" exact>
                        {LoginWrapper}
                    </Route>
                    <Route path="/signup" exact>
                        {SignupWrapper}
                    </Route>
                    <Route exact path='/passwordreset/:uidb64?/:token?'>
                        {PasswordWrapper}
                    </Route>
                    <Route path='/' component={Home} exact/>
                </Switch>
                <Footer/>
            </>
      );
    }

    componentDidMount() {
        console.log('Home DID MOUNT!!!');

    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.token !== null,
        username: state.auth.username
    }
}

export default connect(mapStateToProps)(HomePage);