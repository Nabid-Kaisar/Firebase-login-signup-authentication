import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import 'firebase/firestore';

export default class MainPage extends Component {
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

  readUserData(email) {
    firebase.database().ref(`users/${email}`).once('value').then((snapshot) => {
      var username = (snapshot.val() && snapshot.val().name) || 'Anonymous';
      var phone = (snapshot.val() && snapshot.val().phone) || 'Anonymous';
      // ...
      console.log(username);
      console.log(phone);
    });
  }

  encodeEmail = email => {
    return email.replace(".", ",");
  };

  handleDisplayLoginData= () =>{
    //read user data from database
    this.readUserData(this.encodeEmail(firebase.auth().currentUser.email))
  }


  render() {
    console.log(firebase.auth().currentUser);
    return (
      <React.Fragment>
        <div>Successfully Logged in to the main page</div>
        <br />
        <button onClick={this.handleDisplayLoginData}>Display Data</button>
        <br />
        <button onClick={this.handleLogout}>Logout</button>
      </React.Fragment>
    );
  }
}
