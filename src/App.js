import React, { Component } from "react";

import Login from "./Login";
import SignUp from "./SignUp";
import MainPage from "./MainPage";
import Loading from "./Loading";
import PhoneAth from "./PhoneAuth";

import "./App.css";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";

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
    console.log("on auth change");
    this.fireBaseListener = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        if (user.phoneNumber) {
          this.changeLoginState(1);
        } else if (user.email) {
          let promise = this.getUserData();
          promise.then(async snapshot => {
            if (snapshot.val() && snapshot.val().enableTwoFactorAuth) {
              this.changeLoginState(3);
            } else {
              this.changeLoginState(1);
            }
          });
        } else {
          console.log("something went wrong");
        }
      } else {
        this.changeLoginState(0);
      }
    });
  };

  encodeEmail = email => {
    if (email) {
      return email.replace(".", "_");
    } else {
      return "Email invalid";
    }
  };

  getUserData = async () => {
    var userEmail = this.encodeEmail(firebase.auth().currentUser.email);
    let promise = this.readUserData(userEmail);
    return promise;
  };

  readUserData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value");
  };

  // readCookie = () => {
  //   var nameEQ = "userEmail=";
  //   var ca = document.cookie.split(";");
  //   for (var i = 0; i < ca.length; i++) {
  //     var c = ca[i];
  //     while (c.charAt(0) === " ") c = c.substring(1, c.length);
  //     if (c.indexOf(nameEQ) === 0) {
  //       return c.substring(nameEQ.length, c.length);
  //     }
  //   }
  //   return null;
  // };

  componentDidMount = () => {
    this.registerOnAuthChange();
  };

  changeLoginState = status => {
    //status 0-> not loggedin,
    // 1-> loggedIN,
    // 2-> processing
    // 3-> phoneauth
    console.log("status: " + status);
    this.setState({ isLoggedIn: status });
  };

  render() {
    let { isLoggedIn } = this.state;
    if (isLoggedIn === 2) {
      return (
        <div className="App">
          <Loading />
        </div>
      );
    } else if (isLoggedIn === 1) {
      return (
        <div className="App">
          <MainPage changeLoginState={this.changeLoginState} />
        </div>
      );
    } else if (isLoggedIn === 0) {
      return (
        <div className="App">
          <Login changeLoginState={this.changeLoginState} />
          <SignUp changeLoginState={this.changeLoginState} />
        </div>
      );
    } else if (isLoggedIn === 3) {
      return (
        <div className="App">
          <PhoneAth changeLoginState={this.changeLoginState} />
        </div>
      );
    } else {
      return (
        <div className="App">
          <Loading />
        </div>
      );
    }
  }
}
