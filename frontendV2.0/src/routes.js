import React from 'react';
import { Route, Switch} from 'react-router-dom';

import Chat from '~/pages/chat/Chat';
import Login from '~/pages/login/Login';
import Signup from '~/pages/signup/Signup';
import Home from "~/pages/home/Home";
import VerifyAfterSignup from "~/pages/verify/Verify";
import NewChat from "~/pages/new-chat/NewChat";
import PasswordReset from '~/pages/verify/PasswordReset'

const BaseRouter = () => {
    return (
        <Switch>
            <Route exact path={'/new-chat/join/:uuid'}>
                <NewChat />
            </Route>

            <Route exact path='/new-chat/:channel?/:chat?'>
                <NewChat />
            </Route>

            <Route path='/verify/' exact>
                <VerifyAfterSignup />
            </Route>

            <Route path='/'>
                <Home />
            </Route>
        </Switch>
    );
}

export default BaseRouter;