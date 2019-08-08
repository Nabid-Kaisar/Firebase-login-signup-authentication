import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";
import "firebase/storage";

export default class PhoneAuth extends Component {
  state = {
    recaptchaResToken: "",
    phoneNumber: "",
    confirmationResult: null,
    vCode: "",
    isCodeSent: "",
    isVerifySuccess: "",
    userEmail: "",
    recaptchaSolved: false,
    newPhone: "",
    codeSendEmail: "",
    codeSendPhoneNumber: ""
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
    let promise = this.readData(userEmail);
    return promise;
  };

  readData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value");
  };

  handleLogout = () => {
    this.createCookie("", -1);
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({ userEmail: "" }, () => {
          console.log(this.state.userEmail);
          this.createCookie("", -1);
          this.props.changeLoginState(0);
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleVCode = e => {
    this.setState({ vCode: e.target.value });
  };

  editPhoneNumber = () => {
    document.getElementById("edit_phone_div_id").style.display = "block";
    console.log("editPhoneNumber");
  };

  editPhoneSave = () => {
    if (this.state.newPhone) {
      this.updatePhoneNumber();
    }
  };

  editPhoneCancel = () => {
    document.getElementById("edit_phone_div_id").style.display = "none";
  };

  handlePhoneNumber = e => {
    this.setState({ newPhone: e.target.value });
  };

  createCookie = (value, days) => {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = date.toGMTString();
    } else expires = "";
    document.cookie = `userEmail=${value};expires=${expires};path=/`;
    console.log(document.cookie);
  };

  readCookie = () => {
    var nameEQ = "userEmail=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };

  updatePhoneNumber = () => {
    console.log(this.state.newPhone);
    var userEmail = this.encodeEmail(this.state.userEmail);
    firebase
      .database()
      .ref(`users/${userEmail}`)
      .update({
        phone: this.state.newPhone
      });
    this.setState({ codeSendPhoneNumber: `phone: ${this.state.newPhone}` });
    document.getElementById("edit_phone_div_id").style.display = "none";
  };

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  componentDidMount() {
    console.log("hgfd");
    document.getElementById("edit_phone_div_id").style.display = "none";
    var phoneNumber = "";
    
    this.setState({ userEmail: this.readCookie() }, () => {
      console.log("read: " + this.state.userEmail);
      let prom = this.getUserData();
      prom.then(snapshot => {
        phoneNumber = (snapshot.val() && snapshot.val().phone) || "Anonymous";
        console.log(phoneNumber);
        //debugger;
        this.setState({
          codeSendPhoneNumber: phoneNumber
        });
      });
    });
    console.log(phoneNumber);

    console.log("read cookie is called");
  }

  // visibleReChaptcha = ()=> {
  //   window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  //     "recaptcha-container",
  //     {
  //       size: "normal",
  //       callback: response => {
  //         console.log("captch res: ", response);
  //         this.setState({ recaptchaResToken: response, recaptchaSolved: true });
  //       },
  //       "expired-callback": () => {
  //         this.setState({ recaptchaSolved: false });
  //         console.log("expired");
  //       }
  //     }
  //   );
  //   window.recaptchaVerifier.render().then(r => {
  //     window.recaptchaWidgetId = r;
  //   });
  // }

  sendCode = async () => {
    //handle rechaptcha on invisibly
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: response => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log(response);
        }
      }
    );

    window.recaptchaVerifier.render().then(r => {
      window.recaptchaWidgetId = r;
    });

    var appVerifier = window.recaptchaVerifier;
    console.log(appVerifier);
    let prom = this.getUserData();
    prom.then(snapshot => {
      var phoneNumber = (snapshot.val() && snapshot.val().phone) || "Anonymous";
      if (phoneNumber && appVerifier) {
        console.log(appVerifier);
        firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(async confirmationResult => {
            console.log("conf res");
            console.log(confirmationResult);
            if (confirmationResult) {
              this.setState({ isCodeSent: "Code sent successful" });
            } else {
              this.setState({ isCodeSent: "error sending code" });
            }
            await this.setState({
              confirmationResult
            });
          })
          .catch(error => {
            this.setState({ isCodeSent: "error sending code" });
            console.log(error);
          });
      } else {
        this.setState({
          isCodeSent:
            "error sending code/ check internet connection or invalid number"
        });
        console.log(appVerifier);
      }
    });
  };

  matchVCode = () => {
    console.log(this.state.confirmationResult);
    if (this.state.confirmationResult) {
      this.state.confirmationResult
        .confirm(this.state.vCode)
        .then(res => {
          console.log(res);
          console.log("phone verification successful");
          this.setState({ isVerifySuccess: "verification successful" });
          this.props.changeLoginState(1);
        })
        .catch(err => {
          console.log(err);
          this.setState({
            isVerifySuccess: "verification un-successful/ wrong OTP"
          });
        });
    } else {
      //there might be 2 reason for the error
      this.setState({
        isVerifySuccess:
          "no confirmation res/ Captcha not completed or Wrong OTP entered"
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div
          className="captcha-pos"
          ref={capt => (this.recapt = capt)}
          id="recaptcha-container"
        />
        <br />
        {/* <div>{this.state.codeSendEmail}</div> */}
        <div>
          {this.state.codeSendPhoneNumber}
          {/* <button onClick={this.editPhoneNumber}>Edit</button> */}
        </div>
        <br />
        <div id="edit_phone_div_id">
          <span>Enter phone number here:</span>
          <br />
          <input onChange={this.handlePhoneNumber} />
          <br />
          <button onClick={this.editPhoneSave}>Save</button>
          <button onClick={this.editPhoneCancel}>Cancel</button>
        </div>
        <br />
        <br />
        <button id="send_code_button" onClick={this.sendCode}>
          Send Code
        </button>
        <br />
        <br />
        <div>{this.state.isCodeSent}</div>
        <br />
        <span>Enter Verfication code here:</span>
        <br />
        <br />
        <input onChange={this.handleVCode} />
        <br />
        <br />
        <button onClick={this.matchVCode}>Submit and match vCode</button>
        <br />
        <br />
        <div>{this.state.isVerifySuccess}</div>
        <br />
        <br />
        <button onClick={this.handleLogout}>Back to main page</button>
        <br />
      </React.Fragment>
    );
  }
}
