import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";
import "firebase/storage";

export default class MainPage extends Component {
  state = {
    profilePhotoUrl: "",
    profilePhotoName: "",
    checked: false,
    userEmail: ""
  };

  handleDisplayImage = () => {
    var userEmail = this.encodeEmail(this.state.userEmail);
    console.log(userEmail)
    let promise = this.readData(userEmail);
    promise.then(async snapshot => {
      var imageName =
        (snapshot.val() && snapshot.val().imageName) || "Anonymous";
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

  handleCheckBoxClick = () => {
    if (this.state.checked) {
      this.setState({ checked: false });
    } else {
      this.setState({ checked: true });
    }
  };

  setTwoFactorAuthForUser = () => {
    console.log(this.state.checked);
    var userEmail = this.encodeEmail(this.state.userEmail);
    firebase
      .database()
      .ref(`users/${userEmail}`)
      .update({
        enableTwoFactorAuth: this.state.checked
      });
  };

  getUserData = async () => {
    var user = this.encodeEmail(this.state.userEmail);
    console.log(user);
    let promise = this.readData(user);
    return promise;
  };

  readData = email => {
    return firebase
      .database()
      .ref(`users/${email}`)
      .once("value");
  };

  displayUserData = () => {
    var prom = this.getUserData();
    prom.then(async snapshot => {
      if (snapshot.val()) {
        console.log(snapshot.val());
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

  handleLogout = () => {
    this.createCookie("", -1);
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({ userEmail: "" }, () => {
          this.createCookie("", -1);
          this.props.changeLoginState(0);
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  componentDidMount() {
    this.setState({ userEmail: this.readCookie() }, () => {
      console.log("read cookie is called");
      let promise = this.getUserData();
      promise.then(async snapshot => {
        var isEnabledTwoFactorAuth = false;
        if (snapshot.val() && snapshot.val().enableTwoFactorAuth) {
          isEnabledTwoFactorAuth = snapshot.val().enableTwoFactorAuth;
        }

        this.setState({ checked: isEnabledTwoFactorAuth });
        if (isEnabledTwoFactorAuth) {
          document.getElementById("checkbox").checked = true;
        } else {
          document.getElementById("checkbox").checked = false;
        }
      });
    });
  }

  render() {
    return (
      <React.Fragment>
        <h1 className="large bold title-margin">Successfully Logged in</h1>
        <br />
        <button onClick={this.handleDisplayImage}>Display Image</button>
        <br />
        <br />
        <button onClick={this.displayUserData}>Display User Data</button>
        <br />
        <br />
        <span>Two factor authentication:</span>
        <input
          type="checkbox"
          onChange={this.handleCheckBoxClick}
          className="filled-in"
          id="checkbox"
        />
        <br />
        <button onClick={this.setTwoFactorAuthForUser}>Save Settings</button>
        <br />
        <br />
        <button onClick={this.handleLogout}>Logout</button>
        <br />
        <br />
        <div>
          <img
            height="150px"
            width="250px"
            src={this.state.profilePhotoUrl}
            alt=""
          />
        </div>
      </React.Fragment>
    );
  }
}
