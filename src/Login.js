import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";

export default class Login extends Component {
  state = {
    email: "",
    passWord: "",
    loginMsg: "",
    showOTPField: false,
    wrongOtpMsg: "",
    resToken: ""
  };

  handleEmail = e => {
    this.setState({ email: e.target.value });
  };

  handlePassword = e => {
    this.setState({ passWord: e.target.value });
  };

  handleLogin = async () => {
    this.props.changeLoginState(2); //loading..
    const { email, passWord } = this.state;
    if (email !== "" && passWord !== "") {
      let loginData = await firebase
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
      if (loginData) {
        //login succcessful with email & pass.. now check otp
        console.log(firebase.auth().currentUser);
        // this.setState({ showOTPField: true });
        console.log("loginData: ", loginData);
      } else {
        //wrong uname/pass msg
        console.log("wrong uname/password");
      }
    } else {
      console.log("input fields cant be empty ");
    }
  };

  registerOnStateChange = () => {
    let changeLoginState = this.props.changeLoginState;
    firebase.auth().onAuthStateChanged(function(user) {
      //anytime a sign in state changed this callback fn will be invoked
      // changeLoginState(2);
      console.log("login");
      console.log(user);
      if (user) {

        changeLoginState(1);
        // User is signed in.
        // if (user.phoneNumber) {
        //   changeLoginState(1);
        // } else {
        //   // changeLoginState(0);
        //   //fetch phone no from db
        // }
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

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  componentDidMount = () => {
    this.registerOnStateChange();
  };

  render() {
    const loginForm = (
      <React.Fragment>
        <h1 className="large bold title-margin">Login using firebase auth:</h1>
        <span className="small-margin small-mr">Email : </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handleEmail}
        />
        <br />
        <span className="small-margin">Password : </span>
        <input
          className="small-margin"
          type="password"
          onChange={this.handlePassword}
        />
        <br />
        <button className="small-margin" onClick={this.handleLogin}>
          Login
        </button>
        <div>{this.state.loginMsg}</div>
        <button className="comp-margin" onClick={this.loginStatusCheck}>
          Login status check
        </button>
      </React.Fragment>
    );

    const codeElem = (
      <div>
        <span className="small-margin small-mr">CODE : </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handleVCode}
        />

        <button onClick={this.handleCodeSubmit}> Submit </button>
        <br />
      </div>
    );

    return (
      <React.Fragment>
        {this.state.showOTPField ? codeElem : loginForm}
        <h4>{this.state.wrongOtpMsg}</h4>
      </React.Fragment>
    );
  }
}
