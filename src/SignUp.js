import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";

export default class SignUp extends Component {
  state = {
    email: "",
    passWord: "",
    loginMsg: "",
    phone: "",
    nick: "",
    file: {}
  };

  handleEmail = e => {
    this.setState({ email: e.target.value });
  };

  handlePassword = e => {
    this.setState({ passWord: e.target.value });
  };

  handlePhone = e => {
    this.setState({ phone: e.target.value });
  };

  handleNick = e => {
    this.setState({ nick: e.target.value });
  };

  handleFile = e => {
    this.setState({ file: e.target.value });
  };

  updateProfileInfo = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user.updateProfile({
          displayName: this.state.nick
        });
      }
    });
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

  componentDidMount() {
    this.updateProfileInfo();
  }

  render() {
    return (
      <React.Fragment>
        <h1 className="large bold title-margin">Sign up </h1>
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

        <span className="small-margin small-mr">Phone : </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handlePhone}
        />
        <br />

        <span className="small-margin small-mr">NickName : </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handleNick}
        />
        <br />

        <span className="small-margin small-mr">Image : </span>
        <input
          className="small-margin"
          type="file"
          onChange={this.handleFile}
        />
        <br />

        <button onClick={this.handleSignUp}>Sign Up</button>
        <div>{this.state.loginMsg}</div>
      </React.Fragment>
    );
  }
}
