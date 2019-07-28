import React, { Component } from "react";

import { firebase } from "@firebase/app";
import "@firebase/auth";

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

  render() {
    return (
      <React.Fragment>
        <div>Successfully Logged in to the main page</div>

        <br />
        <button onClick={this.handleLogout}>Logout</button>
      </React.Fragment>
    );
  }
}
