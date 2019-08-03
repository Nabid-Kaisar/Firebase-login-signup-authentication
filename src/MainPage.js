import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";
import "firebase/storage";
import { async } from "@firebase/util";

export default class MainPage extends Component {
  state = {
    recaptchaResToken: "",
    phoneNumber: "",
    confirmationResult: null,
    vCode: "",
    profilePhotoUrl: "",
    profilePhotoName: "",
    imageName: "",
    isCodeSent: "",
    isVerifySuccess: ""
  };

  handleDisplayImage = () => {
    console.log(firebase.auth().currentUser);
    var userEmail = this.encodeEmail(firebase.auth().currentUser.email);
    console.log(userEmail);
    let promise = this.readUserData(userEmail);
    console.log(promise);
    promise.then(async snapshot => {
      var imageName =
        (snapshot.val() && snapshot.val().imageName) || "Anonymous";
      // ...
      console.log(imageName);
      this.setState(
        {
          profilePhotoName: imageName
        },
        () => {
          this.getImage();
        }
      );
    });
  };

  getImage() {
    let image = this.state.profilePhotoName;
    let storage = firebase.storage().ref();
    storage
      .child(`images/${image}`)
      .getDownloadURL()
      .then(url => {
        this.setState({
          profilePhotoUrl: url
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getUserData = async () => {
    var userEmail = this.encodeEmail(firebase.auth().currentUser.email);
    console.log(userEmail);
    let promise = this.readUserData(userEmail);
    return promise;
  };

  readUserData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value");
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

  encodeEmail = email => {
    if (email){
      return email.replace(".", "_")
    }else{
      return "error"
    }
  };

  handleDisplayLoginData = () => {
    let promise = this.getUserData();
    promise.then(res=>{
      console.log(res)
    }).catch(err=>{
      console.error(err);
    })
  };

  handleVCode = e => {
    this.setState({ vCode: e.target.value });
  };

  matchVCode = () => {
    console.log(this.state.confirmationResult);
    if (this.state.confirmationResult) {
      this.state.confirmationResult
        .confirm(this.state.vCode)
        .then(res => {
          console.log(res);
          console.log("phone verification successful");
          this.setState({isVerifySuccess: "verification successful"});
        })
        .catch(err => {
          console.log(err);
          console.log("phone verification unsuccessful");
          this.setState({isVerifySuccess: "verification unsuccessful"});
        });
    } else {
      //there might be 2 reason for the error
      this.setState({isVerifySuccess: "no confirmation res/ Captcha not completed or Wrong OTP entered"});
      console.log("no confirmation res/ Wrong OTP entered../ Captcha not completed");
    }
  };

  sendCode = async () => {
    var appVerifier = window.recaptchaVerifier;
    console.log(appVerifier)
    let prom = this.getUserData();
    prom.then(snapshot => {
      var phoneNumber = (snapshot.val() && snapshot.val().phone) || "Anonymous";
      console.log(phoneNumber);

      var provider = new firebase.auth.PhoneAuthProvider();
      console.log(provider);
      // provider
      //   .verifyPhoneNumber(phoneNumber, appVerifier)
      //   .then(verificationId => {
      //     console.log(verificationId);
      //     // var cred = firebase.auth.PhoneAuthProvider.credential(
      //     //   verificationId,
      //     //   this.state.vCode
      //     // );
      //     // console.log(cred);
      //     // user.updatePhoneNumber({ cred });
      //     // console.log("update phn no", user.updatePhoneNumber({ cred }));
      //   })
      //   .catch(err => {
      //     console.log("err");
      //   });
      if (this.state.confirmationResult){
        console.log("confor")
      }

      if (phoneNumber && appVerifier) {
        console.log(appVerifier)
        firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(async confirmationResult => {
            console.log("conf res");
            console.log(confirmationResult);
            if(confirmationResult){
              this.setState({isCodeSent: "Code sent successful"});
            }else{
              this.setState({isCodeSent: "error sending code"});
            }
            await this.setState({
              confirmationResult
            });
          })
          .catch(error => {
            this.setState({isCodeSent: "error sending code"});
            console.log(error);
          });
      }else{
        this.setState({isCodeSent: "error sending code"});
        console.log(appVerifier );
      }
    });
  };

  componentDidMount() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: response => {
          console.log("captch res: ", response);
          this.setState({ recaptchaResToken: response });
        },
        "expired-callback": () => {
          console.log("expired");
        }
      }
    );
    window.recaptchaVerifier.render().then(r => {
      window.recaptchaWidgetId = r;
    });
  }

  render() {
    return (
      <React.Fragment>
        <div
          className="captcha-pos"
          ref={capt => (this.recapt = capt)}
          id="recaptcha-container"
        />
        <div>Successfully Logged in to the main page</div>
        <br />
        <button onClick={this.handleDisplayImage}>Display Image</button>
        <br />
        <br />
        <button onClick={this.handleDisplayLoginData}>Display Data</button>
        <br />
        <br />
        <button onClick={this.sendCode}>Send Code</button>
        <br />
        <br />
        <div>{this.state.isCodeSent}</div>
        <br/>
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
        <br/>
        <button onClick={this.handleLogout}>Logout</button>
        <br />
        <div>
          <img
            height="150px"
            width="250px"
            src={this.state.profilePhotoUrl}
            alt="profile image"
          />
        </div>
      </React.Fragment>
    );
  }
}
