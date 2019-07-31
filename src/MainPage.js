import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";

export default class MainPage extends Component {
  state = {
    recaptchaResToken: "",
    phoneNumber: "",
    confirmationResult: null,
    vCode: ""
  };

  handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.changeLoginState(0);
      })
      .catch(err => {
        console.error(err);
      });
  };

  readUserData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value")
      .then(snapshot => {
        var username = (snapshot.val() && snapshot.val().name) || "Anonymous";
        var phone = (snapshot.val() && snapshot.val().phone) || "Anonymous";
        // ...
        return [username, phone];
      });
  };

  encodeEmail = email => {
    return email.replace(".", ",");
  };

  handleDisplayLoginData = () => {
    //read user data from database
    this.readUserData(this.encodeEmail(firebase.auth().currentUser.email));
  };

  handleVCode = e => {
    this.setState({ vCode: e.target.value });
  };

  matchVCode = () => {
    if (this.state.confirmationResult) {
      console.log("56");
      this.state.confirmationResult
        .confirm(this.state.vCode)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
          this.setState({ errorMsg: "Wrong OTP entered" });
        });
    } else {
      //there might be 2 reason for the error
      this.setState({
        errorMsg: "Wrong OTP entered../ Captcha not completed"
      });
    }
  };

  sendCode = async () => {
    var appVerifier = window.recaptchaVerifier;
    console.log(appVerifier);
    var provider = new firebase.auth.PhoneAuthProvider();
    console.log(provider);
    provider
      .verifyPhoneNumber(this.state.phoneNumber, appVerifier)
      .then(verificationId => {
        console.log("90");
        var cred = firebase.auth.PhoneAuthProvider.credential(
          verificationId,
          this.state.vCode
        );
        console.log(cred);
        // user.updatePhoneNumber({ cred });
        // console.log("update phn no", user.updatePhoneNumber({ cred }));
      })
      .catch(err => {
        console.log(err);
      });

    const up = await this.readUserData(
      this.encodeEmail(firebase.auth().currentUser.email)
    ).then(async res => {
      await this.setState({ phoneNumber: res[1] });
    });

    var appVerifier = window.recaptchaVerifier;

    if (this.state.phoneNumber !== "" && appVerifier) {
      console.log(this.state.phoneNumber);
      console.log(appVerifier);

      firebase
        .auth()
        .signInWithPhoneNumber(this.state.phoneNumber, appVerifier)
        .then(async confirmationResult => {
          await this.setState({
            confirmationResult
          });
        })
        .catch(error => {
          // Error; SMS not sent
          console.log(error);
        });
    }
  };

  componentDidMount() {
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
  }

  render() {
    console.log(firebase.auth().currentUser);
    return (
      <React.Fragment>
        <div
          className="captcha-pos"
          ref={capt => (this.recapt = capt)}
          id="recaptcha-container"
        />
        <div>Successfully Logged in to the main page</div>
        <br />
        <button onClick={this.handleDisplayLoginData}>Display Data</button>
        <br />
        <button onClick={this.sendCode}>Send Code</button>
        <span>Enter Verfication code here:</span>
        <input onChange={this.handleVCode} />
        <button onClick={this.matchVCode}>Submit and match vCode</button>
        <button onClick={this.handleLogout}>Logout</button>
      </React.Fragment>
    );
  }
}
