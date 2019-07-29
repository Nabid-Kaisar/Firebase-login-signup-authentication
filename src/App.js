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
    isLoggedIn: 2
  };



  registerOnAuthChange = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ isLoggedIn: 1 });
        //update profile Info

      } else {
        this.setState({ isLoggedIn: 0 });
      }
    });
  };

  componentDidMount = () => {
    this.registerOnAuthChange();
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
      return <Loading />;
    } else if (isLoggedIn === 1) {
      return <MainPage changeLoginState={this.changeLoginState} />;
    } else if (isLoggedIn === 0) {
      return (
        <div className="App">
          <Login changeLoginState={this.changeLoginState} />
          <SignUp />
        </div>
      );
    } else return <Loading />;
  }
}
