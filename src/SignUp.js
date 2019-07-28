import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";

export default class SignUp extends Component {
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

  handleSignUp = async () => {
    const { email, passWord } = this.state;
    if (email !== "" && passWord !== "") {
      let signUpData = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, passWord)
        .catch(error => {
          // Handle Errors here.
          console.error(error);
          console.log("cant register with that username / password");
          // ...
        });
      if (signUpData) {
        //successful
        console.log(signUpData);
      }
    } else {
      console.log("input fields cant be empty ");
    }
  };

  loginStatusCheck = () => {
    const user = firebase.auth().currentUser;
    //if not logged in user will return null..
    console.log(user);
  };

  handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("successfully signed out");
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    return (
      <React.Fragment>
        <div className="large bold underlined title-margin">Sign up </div>
        <span className="small-margin">Email: </span>
        <input  className="small-margin" type="text" onChange={this.handleEmail} />
        <br />
        <span className="small-margin">Password:</span>
        <input
          className="small-margin"
          type="password"
          onChange={this.handlePassword}
        />
        <br />
        <button onClick={this.handleSignUp}>Sign Up</button>
        <div>{this.state.loginMsg}</div>
      </React.Fragment>
    );
  }
}
