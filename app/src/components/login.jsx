import React, { Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";

import * as LocalConfig from "./local_config";
import loginFormOne from "../json/form_login_one.json";
import loginFormTwo from "../json/form_login_two.json";
import loginFormThree from "../json/form_login_three.json";
import loginFormDirect from "../json/form_login_direct.json";
import Nav from "./nav";


class Login extends Component {
  state = {
    stage: 1,
    pageid:"login",
    navinfo:{
      login:[
        {id:"home", label: "Home", url: "/"},
        {id:"login", label: "Login", url: "/login"}
      ]
    },
    navparaminfo:{},
    dialog:{
      status:false, 
      msg:""
    }
  };

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  handleLoginDirect = () => {
    getLoginDirectResponse(loginFormDirect).then(result => {
      if (result.status === 0){
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
        this.setState(tmpState);
        return;
      }
      localStorage.setItem("access_csrf", result.access_csrf);
      var tmpState = this.state;
      tmpState.stage = 4;
      tmpState.response = result;
      this.setState(tmpState);

    });
  }

  handleLoginOne = () => {
    getLoginOneResponse(loginFormOne).then(result => {
      if (result.status === 0){
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
        this.setState(tmpState);
        return;
      }
      var tmpState = this.state;
      tmpState.stage = 2;
      tmpState.response = result;
      this.setState(tmpState);
    });
  }

  handleLoginTwo = () => {
    
    var tmpState = this.state;
    tmpState.stage = -1;
    this.setState(tmpState);


    var email = this.state.response.email;
    getLoginTwoResponse(loginFormTwo, email).then(result => {
      if (result.status === 0){
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
        this.setState(tmpState);
        return;
      }
      var tmpState = this.state;
      tmpState.stage = 3;
      tmpState.response = result;
      this.setState(tmpState);
    });
  }



  handleLoginThree = () => {  
    var email = this.state.response.email;
    var sharedKey = this.state.response.shared_key;
    getLoginThreeResponse(loginFormThree, email, sharedKey).then(result => {
      if (result.status === 0){
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
        this.setState(tmpState);
        return;
      }
      localStorage.setItem("access_csrf", result.access_csrf);
      var tmpState = this.state;
      tmpState.stage = 4;
      tmpState.response = result;
      this.setState(tmpState);
      return;
    });
  }



  render() {


    window.history.pushState({}, null, "/login");

    var cn = "";
    if (this.state.stage === 1){
      // for multi step auth
      // change this.handleLoginDirect --> this.handleLoginOne
      // change loginFormDirect --> loginFormOne
      cn = (
        <div>
          <div key={"login_form_one"} className="leftblock " 
            style={{width:"40%", margin:"40px 0px 0px 5%"}}>
            <Formeditor formClass={loginFormDirect.class} formObj={loginFormDirect}/>
          </div>
          <div key={"login_btn_one"} className="leftblock " 
            style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" 
                  onClick={this.handleLoginDirect}>Login </button>
            <br/><br/><a href="/reset_password" style={{textDecoration:"none"}}>Forgot password?</a>
          </div>
        </div>
      );
    }
    else if (this.state.stage === 2){
      cn = (
        <div>
          <div key={"login_form_two"} className="leftblock "
            style={{width:"40%", margin:"40px 0px 0px 5%"}}>
            <Formeditor formClass={loginFormTwo.class} formObj={loginFormTwo}/>
          </div>
          <div key={"login_btn_two"} className="leftblock "
            style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleLoginTwo}>Send </button>
          </div>
        </div>
      );
    }
    else if (this.state.stage === 3){
        cn = (
        <div>
          <div key={"login_form_three"} className="leftblock "
            style={{width:"40%", margin:"40px 0px 0px 5%"}}>
            <Formeditor formClass={loginFormThree.class} formObj={loginFormThree}/>
          </div>
          <div key={"login_btn_three"} className="leftblock "
            style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleLoginThree}>Submit </button>
          </div>
        </div>
      );
    }
    else if (this.state.stage === 4){
      window.location.href = "/dashboard";
    }
    else if (this.state.stage === -1){
      cn =  (<Loadingicon/>);
    }

    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} navParamInfo={this.state.navparaminfo}/>
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          {cn}
        </div>
      </div>


      
  );
    
  }
}

export default Login;
