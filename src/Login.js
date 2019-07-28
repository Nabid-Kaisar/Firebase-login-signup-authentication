import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";

export default class Login extends Component {
  state = {
    email: "",
    passWord: "",
    loginMsg: ""
  };

  handleEmail = e => {
    this.setState({ email: e.target.value });
  };

  handlePassword = e => {
    this.setState({ passWord: e.target.value });
  };

  handleLogin = () => {
    this.props.changeLoginState(2);
    const { email, passWord } = this.state;
    if (email !== "" && passWord !== "") {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, passWord)
        .catch(error => {
          this.props.changeLoginState(0);
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;

          console.log(errorMessage, errorCode);
          console.error(error);
        });
    } else {
      console.log("input fields cant be empty ");
    }
  };

  registerOnStateChange = changeLoginState => {
    firebase.auth().onAuthStateChanged(function(user) {
      //anytime a sign in state changed this callback fn will be invoked
      // changeLoginState(2);
      if (user) {
        // User is signed in.
        changeLoginState(1);
      } else {
        changeLoginState(0);
        console.log("no user");
        // No user is signed in.
      }
    });
  };

  loginStatusCheck = () => {
    const user = firebase.auth().currentUser;
    //if not logged in user will return null..
    console.log(user);
  };

  componentDidMount = () => {
    this.registerOnStateChange(this.props.changeLoginState);
  };

  render() {
    return (
      <React.Fragment>
        <div className="large bold underlined title-margin">Login using firebase auth:</div>
        <div>Email</div>
        <input type="text" onChange={this.handleEmail} />

        <div>Password</div>

        <input type="password" onChange={this.handlePassword} />
        <br />
        <button onClick={this.handleLogin}>Login</button>
        <div>{this.state.loginMsg}</div>
        <button className="comp-margin" onClick={this.loginStatusCheck}>
          Login status check
        </button>
      </React.Fragment>
    );
  }
}
