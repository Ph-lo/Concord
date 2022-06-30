import React from "react";
import "../styles/Login.css";
import logo from "../Logo-irc.png";

function Form(props) {
  return (
    <>
      <div className="divLogo">
        <img className="logo" src={logo} alt="logo" />
      </div>
      <h3 className="siteTitle">Concord</h3>
      <form className="loginForm">
        <input
          className="loginInput"
          placeholder="Username..."
          type="text"
          value={props.username}
          onChange={props.onChange}
        />
        <br />
        <button className="loginButton" onClick={props.connect}>
          Connect
        </button>
      </form>
    </>
  );
}

export default Form;
