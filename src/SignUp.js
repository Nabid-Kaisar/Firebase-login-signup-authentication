import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "firebase/firestore";
import "@firebase/storage";

export default class SignUp extends Component {
  state = {
    email: "",
    passWord: "",
    signUpFailedMsg: "",
    phone: "",
    nick: "",
    selectedFile: null,
    mainImage: null,
    fileNameEx: ""
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
    this.setState({ selectedFile: e.target.files[0], loaded: 0 }, () => {
      const fileElem = this.inputElm.files[0];

      let file = fileElem;
      const stroageRef = firebase.storage().ref("/images");
      var fileName = Date.now();
      var fileNameEx = fileName + "." + file.type.split("/")[1];
      this.setState({ fileNameEx });
      const mainImage = stroageRef.child(fileNameEx);

      this.setState({ mainImage });
    });
  };

  encodeEmail = email => {
    if (email) {
      return email.replace(".", "_");
    } else {
      return "Email invalid";
    }
  };

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  createCookie = (value, days) => {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = date.toGMTString();
    } else expires = "";
    document.cookie = `userEmail=${value};expires=${expires};path=/`;
  };

  writeUserData(ecodedEmail, email, name, phoneNumber) {
    //debugger
    if (this.state.mainImage !== null) {
      this.state.mainImage.put(this.state.selectedFile).then(res => {
        console.log(res);
      });

      //error to store data to firebase db delele user from auth
      var sData = firebase
        .database()
        .ref(`users/${ecodedEmail}`)
        .set(
          {
            email: email,
            name: name,
            phone: phoneNumber,
            imageName: this.state.fileNameEx,
            enableTwoFactorAuth: false
          },(error) => {
            //delete user form here
            if(error){
              //this.deleteUser();
            }            
          }
        );

        if (sData){
          this.createCookie(email, 1);
        }

      console.log(sData);

      //this.props.changeLoginState(3)
      this.createCookie(this.state.email, 1);
    } else {
      console.log("no image");
    }
  }

  handleSignUp = async () => {
    this.createCookie("", -1);
    console.log("create cookie called");
    if (
      this.state.email !== "" &&
      this.state.passWord !== "" &&
      this.state.phone !== "" &&
      this.state.selectedFile !== null
    ) {
      let signUpData = await firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.passWord)
        .catch(error => {
          if (error) {
            alert("can not register with this username / password");
          } else {
            console.log("successfully sign up");
          }
        });

      if (signUpData) {
        this.createCookie(this.state.email, 1);
        //uploading user data to database
        this.writeUserData(
          this.encodeEmail(this.state.email),
          this.state.email,
          this.state.nick,
          this.state.phone
        );
      } else {
        //alert("somethings went wrong");
      }
    } else {
      alert("input fields cant be empty");
    }
  };

  // deleteUser = () => {
  //   var user = firebase.auth().currentUser;
  //   user
  //     .delete()
  //     .then(() => {
  //       console.log("deleted user");
  //       // User deleted.
  //     })
  //     .catch(error => {
  //       // An error happened.
  //     });
  // };

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
        <span className="small-margin small-mr">Phone: </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handlePhone}
        />
        <br />
        <span className="small-margin">NickName : </span>
        <input
          className="small-margin"
          type="text"
          onChange={this.handleNick}
        />
        <br />
        <span className="small-margin small-mr">Image : </span>
        <input
          className="small-margin"
          id="file-up"
          type="file"
          onChange={this.handleFile}
          ref={inpElm => (this.inputElm = inpElm)}
        />
        <br />
        <button onClick={this.handleSignUp}>Sign Up</button>
      </React.Fragment>
    );
  }
}
