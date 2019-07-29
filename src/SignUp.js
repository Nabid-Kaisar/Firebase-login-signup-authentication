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
    vCode: "",
    resToken: "",
    file: {},
    promptVerCode: false,
    confirmationResult: {}
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

  handleVCode = e => {
    this.setState({ vCode: e.target.value });
  };

  handleFile = e => {
    this.setState({ file: e.target.value });
  };

  updateProfileInfo = () => {
    firebase.auth().onAuthStateChanged(user => {
      console.log("onauth");
      if (user) {
        user.updateProfile({
          displayName: this.state.nick
        });

        var appVerifier = window.recaptchaVerifier;
        if (this.state.phone !== "" && appVerifier) {
          console.log(this.state.phone);
          console.log(appVerifier);
          firebase
            .auth()
            .signInWithPhoneNumber(this.state.phone, appVerifier)
            .then(async confirmationResult => {
              this.setState(
                {
                  confirmationResult
                },
                () => {
                  this.setState({ promptVerCode: true });
                }
              );
            })
            .catch(error => {
              // Error; SMS not sent
              console.log(error);
            });

          var provider = new firebase.auth.PhoneAuthProvider();
          provider
            .verifyPhoneNumber(this.state.phone, this.state.resToken)
            .then(verificationId => {
              var cred = firebase.auth.PhoneAuthProvider.credential(
                verificationId,
                this.state.vCode
              );
              user.updatePhoneNumber({ cred });
            });
        }
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
        this.updateProfileInfo();

        console.log(signUpData);
      }
    } else {
      console.log("input fields cant be empty ");
    }
  };

  handleCodeSubmit = () => {
    this.state.confirmationResult.confirm(this.state.vCode).then(res => {
      console.log(res);
    })
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
    // this.updateProfileInfo();
    
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: response => {
          this.setState({ resToken: response });
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
  }

  render() {
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
        <div ref={capt => (this.recapt = capt)} id="recaptcha-container" />
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
        {this.state.promptVerCode ? codeElem : null}

        <button onClick={this.handleSignUp}>Sign Up</button>
        <div>{this.state.loginMsg}</div>
      </React.Fragment>
    );
  }
}
