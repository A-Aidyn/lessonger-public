import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './store/actions/auth'
import 'antd/dist/antd.css';
import BaseRouter from "./routes";
import Home from "~/pages/home/Home";


class App extends React.Component {
    constructor(props) {
        super(props);
        this.props.onTryAutoSignup();
    }

    render() {
        return (
            <Router>
                 <BaseRouter />
            </Router>
        )
    }

    componentDidMount() {
        this.props.onTryAutoSignup(); // every time the component is mounted we call onTryAutoSignup that is dispatch(actions.authCheckState())
    }
}

// This method converts state from the store (react redux) into properties that we can pass into our application
// Mapping state, a value that is contained in the state
const mapStateToProps = state => {
    return {

    }
}

// Helps to check the authentication state each time when the app is rendered (re-rendered)
// Mapping a method
const mapDispatchToProps = dispatch => {
    return {
        onTryAutoSignup: () => dispatch(actions.authCheckState())
    }
}

// connect() lets you inject Redux state into a regular React component.
// Also it grabs the store that we've created in index.js and it will allow us some of the states from the store
export default connect(mapStateToProps, mapDispatchToProps)(App);