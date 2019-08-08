import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
//import { contains } from "@firebase/util";

//changeLoginState(0) => app.js
//changeLoginState(1) => mainpage.js
//changeLoginState(2) => loading.js
//changeLoginState(3) => phoneAuth.js
export default class Login extends Component {
  state = {
    userEmail: "",
    passWord: ""
  };

  componentDidMount = () => {
    document.getElementById("forgot_password_div_id").style.display = "none";
    this.setState({ userEmail: "" });
    // this.setState({ userEmail: "" }, () => {
    //   //this.registerOnStateChange();
    // });
  };

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  handleEmail = e => {
    this.setState({ userEmail: e.target.value });
  };

  handlePassword = e => {
    this.setState({ passWord: e.target.value });
  };

  handleLogin = async () => {
    this.props.changeLoginState(2); //loading..
    if (this.state.userEmail !== "" && this.state.passWord !== "") {
      let loginData = await firebase
        .auth()
        .signInWithEmailAndPassword(this.state.userEmail, this.state.passWord)
        .catch(error => {
          alert("wrong uname/password");
          this.props.changeLoginState(0);
        });
      console.log(loginData);
      if (loginData) {
        this.createCookie(this.state.userEmail, 1);
      }
    } else {
      alert("input fields cant be empty");
      this.props.changeLoginState(0);
    }
  };

  encodeEmail = email => {
    if (email) {
      return email.replace(".", "_");
    } else {
      return "Email invalid";
    }
  };

  getUserData = async () => {
    var userEmail = this.encodeEmail(this.state.userEmail);
    console.log(userEmail);
    let promise = await this.readData(userEmail);
    return promise;
  };

  readData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value");
  };

  // registerOnStateChange = () => {
  //   let changeLoginState = this.props.changeLoginState;
  //   firebase.auth().onAuthStateChanged(user => {
  //     //anytime a sign in state changed this callback fn will be invoked

  //     if (user) {
  //       if (user.phoneNumber) {
  //         console.log(user.phoneNumber);
  //         this.props.changeLoginState(1);
  //       } else if (user.email) {
  //         //debugger;
  //         this.setState({
  //           userEmail: user.email
  //         });
  //         console.log(user.email);
  //         this.createCookie(user.email, 1);
  //         let promise = this.getUserData();
  //         console.log(promise);
  //         promise.then(async snapshot => {
  //           console.log(snapshot.val());
  //           if (snapshot.val() && snapshot.val().enableTwoFactorAuth) {
  //             this.props.changeLoginState(3);
  //           } else {
  //             this.props.changeLoginState(1);
  //           }
  //         });
  //       } else {
  //         console.log("something went wrong");
  //       }
  //     } else {
  //       this.props.changeLoginState(0);
  //     }

  //     // console.log(user);
  //     // var isEnabledTwoFactorAuth = false;
  //     // if (user) {
  //     //   console.log(user.email)
  //     //   if (user.email) {
  //     //     let promise = this.getUserData();
  //     //     promise.then(async snapshot => {
  //     //       if (snapshot.val() && snapshot.val().enableTwoFactorAuth) {
  //     //         isEnabledTwoFactorAuth = snapshot.val().enableTwoFactorAuth;
  //     //         this.createCookie(user.email, 1);
  //     //         if (isEnabledTwoFactorAuth) {
  //     //           console.log("user.emai")
  //     //           changeLoginState(3);
  //     //         } else {
  //     //           console.log("user.emai")
  //     //           changeLoginState(1);
  //     //         }
  //     //       }
  //     //       console.log("user.emai")
  //     //       this.createCookie(user.email, 1);
  //     //     });
  //     //   }else{
  //     //     console.log("no user");
  //     //   }
  //     // } else {
  //     //   changeLoginState(0);
  //     //   console.log("no user");
  //     // }
  //   });
  // };

  createCookie = (value, days) => {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = date.toGMTString();
    } else expires = "";
    document.cookie = `userEmail=${value};expires=${expires};path=/`;
  };

  sendEmailForgotPassword = emailAddress => {
    var auth = firebase.auth();
    auth
      .sendPasswordResetEmail(emailAddress)
      .then(() => {
        document.getElementById("forgot_password_div_id").style.display =
          "none";
        alert("Email sent to: " + emailAddress);
      })
      .catch(error => {
        alert("Something went wrong/ wrong email");
      });
  };

  handleForgotPassword = () => {
    document.getElementById("forgot_password_div_id").style.display = "block";
  };

  handleSendEmail = () => {
    console.log(this.state.emailSend);
    if (this.state.emailSend) {
      this.sendEmailForgotPassword(this.state.emailSend);
    }
  };

  sendEmailCancel = () => {
    document.getElementById("forgot_password_div_id").style.display = "none";
  };

  handleForgotPasswordInput = e => {
    this.setState({ emailSend: e.target.value });
  };

  render() {
    return (
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
        <button className="small-margin" onClick={this.handleForgotPassword}>
          Forgot Password
        </button>
        <button className="small-margin" onClick={this.handleLogin}>
          Login
        </button>
        <div id="forgot_password_div_id">
          <span>Enter email here:</span>
          <br />
          <input onChange={this.handleForgotPasswordInput} />
          <br />
          <button onClick={this.handleSendEmail}>Send email</button>
          <button onClick={this.sendEmailCancel}>Cancel</button>
        </div>
      </React.Fragment>
    );
  }
}
