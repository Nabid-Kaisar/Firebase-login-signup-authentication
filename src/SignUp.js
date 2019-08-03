import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import 'firebase/firestore';
import "@firebase/storage";

export default class SignUp extends Component {
  state = {
    email: "",
    passWord: "",
    signUpFailedMsg: "",
    phone: "",
    nick: "",
    vCode: "",
    resToken: "",
    selectedFile: null,
    promptVerCode: false,
    confirmationResult: null,
    showOTPField: false,
    errorMsg: "",
    recaptchaSolveMsg: "",
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

  handleVCode = e => {
    this.setState({ vCode: e.target.value });
  };

  handleFile = e => {
    this.setState({ selectedFile: e.target.files[0], loaded: 0 },()=>{
      const fileElem = this.inputElm.files[0];
    
      let file = fileElem;
      const stroageRef = firebase.storage().ref('/images');
      var fileName = Date.now();
      var fileNameEx = fileName + "." + file.type.split("/")[1];
      this.setState({fileNameEx});
      const mainImage = stroageRef.child(fileNameEx);

      this.setState({mainImage})
    });

  };

  encodeEmail = email => {
    return email.replace(".", "_");
  };

  writeUserData(email, name, phoneNumber) {

    // const file = this.inputElm.files[0];
    // let file = document.getElementById("file-up");
    // console.log(file);
    // file = file.files[0];
    // const stroageRef = firebase.storage().ref('/images');
    // var fileName = Date.now();
    // var fileNameEx = fileName + "." + file.type.split("/")[1];
    // console.log(fileNameEx);
    // const mainImage = stroageRef.child("" + fileName);
    if(this.state.mainImage !== null){
      this.state.mainImage.put(this.state.selectedFile).then((res)=>{
        console.log(res)
      })
      
  
  
      firebase.database().ref(`users/${email}` ).set({
        name: name,
        phone: phoneNumber,
        imageName: this.state.fileNameEx
      });
    }else {
      console.log("no image")
    }

  }

  updateProfileInfo = () => {
    this.fireBaseListener = firebase.auth().onAuthStateChanged(user => {
      console.log("signup");
      console.log(user);
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
          if (this.props.recaptchaResToken === "") {
            this.setState({ recaptchaSolveMsg: "recaptcha not solved" });
          } else {
            provider
              .verifyPhoneNumber(this.state.phone, this.props.recaptchaResToken)
              .then(verificationId => {
                var cred = firebase.auth.PhoneAuthProvider.credential(
                  verificationId,
                  this.state.vCode
                );
                user.updatePhoneNumber({ cred });
                console.log("update phn no", user.updatePhoneNumber({ cred }));
                
              });
          }
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
          this.setState({ signUpFailedMsg: "signup failed" });
          console.error(error);
          console.log("cant register with that username / password");
          // ...
        });

      if (signUpData) {
        //uploading user data to database
        this.writeUserData(this.encodeEmail(email),this.state.nick, this.state.phone);
        //successful
         this.setState({ showOTPField: true });

         this.updateProfileInfo();

        console.log(signUpData);
      }
    } else {
      console.log("input fields cant be empty ");
    }
  };

  handleCodeSubmit = () => {
    if (this.state.confirmationResult) {
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

  componentWillUnmount() {
    this.fireBaseListener && this.fireBaseListener();
    this.authListener = undefined;
  }

  componentDidUpdate(prevProps) {
    if (this.props.recaptchaResToken !== prevProps.recaptchaResToken) {
      if (this.props.recaptchaResToken !== "") {
        this.setState({ recaptchaSolveMsg: "" });
        this.setState({ errorMsg: "" });
      }
    }
  }

  // uploadImg = () => {
  //   const file = this.inputElm.files[0];
  //   console.log(file)
  //   const stroageRef = firebase.storage().ref('/images');
  //   var fileName = Date.now();
  //   var fileNameEx = fileName + "." + file.type.split("/")[1];
  //   console.log(fileNameEx);
  //   const mainImage = stroageRef.child("" + fileName);
  //   mainImage.put(file).then((res)=>{
  //     console.log(res)
  //   })
  //   console.log(mainImage);
  // }


  componentDidMount() {
    this.updateProfileInfo();
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
        {this.state.recaptchaSolveMsg}
      </div>
    );

    const signUpFrom = (
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
          ref={inpElm=> this.inputElm = inpElm}
        />
    <br />
        <button onClick={this.handleSignUp}>Sign Up</button>
        <div>{this.state.signUpFailedMsg}</div>
        <div>{this.state.recaptchaSolveMsg}</div>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        {this.state.showOTPField ? codeElem : signUpFrom}
        
        {/* <br />
        <button onClick ={this.uploadImg}>Upload Img</button> */}
        <h4>{this.state.errorMsg}</h4>
      </React.Fragment>
    );
  }
}
