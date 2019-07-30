import React, { Component } from "react";

import Login from "./Login";
import SignUp from "./SignUp";
import MainPage from "./MainPage";
import Loading from "./Loading";

import "./App.css";

import { firebase } from "@firebase/app";
import "@firebase/auth";

var app = firebase.initializeApp({
  apiKey: "AIzaSyBSmyJLAZ2fqN7Crx5U2H51Z7wxWV-8-vI",
  authDomain: "invitefirebase.firebaseapp.com",
  databaseURL: "https://invitefirebase.firebaseio.com",
  projectId: "invitefirebase",
  storageBucket: "invitefirebase.appspot.com",
  messagingSenderId: "316478676860",
  appId: "1:316478676860:web:6587c08005c11433"
});

export default class App extends Component {
  state = {
    isLoggedIn: 2,
    recaptchaResToken: ""
  };

  registerOnAuthChange = () => {
    this.fireBaseListener = firebase.auth().onAuthStateChanged(user => {
      console.log("app");
      console.log(user);
      if (user) {
        if (user.phoneNumber) {
          this.setState({ isLoggedIn: 1 });
        } else {
          this.setState({ isLoggedIn: 0 });
        }

        //update profile Info
      } else {
        this.setState({ isLoggedIn: 0 });
      }
    });
  };

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  componentDidMount = () => {
    this.registerOnAuthChange();
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: response => {
          this.setState({ recaptchaResToken: response });
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
          console.log("expired");
        }
      }
    );
    window.recaptchaVerifier.render().then(r => {
      window.recaptchaWidgetId = r;
    });
  };

  changeLoginState = status => {
    //status 0-> not loggedin,
    // 1-> loggedIN,
    // 2-> processing
    this.setState({ isLoggedIn: status });
  };

  render() {
    let { isLoggedIn } = this.state;
    if (isLoggedIn === 2) {
      return (
        <React.Fragment>
          <div
            className="hidden"
            ref={capt => (this.recapt = capt)}
            id="recaptcha-container"
          />
          <Loading />
        </React.Fragment>
      );
    } else if (isLoggedIn === 1) {
      return <MainPage changeLoginState={this.changeLoginState} />;
    } else if (isLoggedIn === 0) {
      return (
        <div className="App">
          <div ref={capt => (this.recapt = capt)} id="recaptcha-container" />
          <Login
            recaptchaResToken={this.state.recaptchaResToken}
            changeLoginState={this.changeLoginState}
          />
          <SignUp
            recaptchaResToken={this.state.recaptchaResToken}
            changeLoginState={this.changeLoginState}
          />
        </div>
      );
    } else return <Loading />;
    // }
  }
}

//  return <SignUp />;
