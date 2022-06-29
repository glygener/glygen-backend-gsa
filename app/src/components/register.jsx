import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import registerFormOne from "../json/form_register_one.json";
import registerFormTwo from "../json/form_register_two.json";

import $ from "jquery";
import { verifyReqObj, verifyPasswords} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";
import Nav from "./nav";


class Register extends Component {
  state = {
    formKey:"step_one",
    recaptcha_token:"",
    pageid:"register",
    navinfo:{
      register:[
        {id:"home", label: "Home", url: "/"},
        {id:"register", label: "Register", url: "/register"}
      ],
      confirmation:[
        {id:"home", label: "Home", url: "/"},
        {id:"confirmation", label: "Confirmation", url: "/confirmation", flag:"disabled"},
      ]
    },
    navparaminfo:{},
    dialog:{
      status:false, 
      msg:""
    }
  };




  verifyCallback = (recaptchaToken) => {
    var tmpState = this.state;
    tmpState["recaptcha_token"] = recaptchaToken;
    this.setState(tmpState);

  }


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }


  handleRegisterOne = () => {

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {coll:"c_user", record:{} };
    var jqClass = ".registerform_one";
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        reqObj["record"][fieldName] = fieldValue;
        
        for (var i in registerFormOne.groups){
            for (var j in registerFormOne.groups[i].emlist){
              var emObj = registerFormOne.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
        //$(this).val("");
    });

    var errorList = verifyReqObj(reqObj.record, registerFormOne);
    errorList = errorList.concat(verifyPasswords(reqObj.record["email"],reqObj.record["password_one"],
      reqObj.record["password_two"]));

    
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      tmpState.formKey = "step_one"
      this.setState(tmpState);
      return;
    }
   
    reqObj["record"]["password"] = reqObj["record"].password_one;
    delete reqObj["record"].password_one;
    delete reqObj["record"].password_two;

    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.auth_register_one;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;  
          tmpState.toconfirmation = true;       
          if (tmpState.response.status === 0){
            tmpState.toconfirmation = false;
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            tmpState.fname = reqObj["record"]["fname"];
            tmpState.lname = reqObj["record"]["lname"];
            tmpState.password = reqObj["record"]["password"];
            tmpState.email = reqObj["record"]["email"];
            tmpState.shared_key = result.shared_key;
            tmpState.formKey = "step_two";
          }
          this.setState(tmpState);
          console.log("Ajax response:", result);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
          console.log("Ajax error:", error);
        }
      );
  }


  handleRegisterTwo = () => {
     
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {
      coll:"c_user", 
      record:{
        "fname":this.state.fname,
        "lname":this.state.lname,
        "email": this.state.email, 
        "password": this.state.password,
        "shared_key": this.state.shared_key
      } 
    };

    var jqClass = ".registerform_two";
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        reqObj["record"][fieldName] = fieldValue;
        for (var i in registerFormOne.groups){
            for (var j in registerFormOne.groups[i].emlist){
              var emObj = registerFormOne.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
        $(this).val("");
    });


    var errorList = verifyReqObj(reqObj.record, registerFormTwo);

    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      this.setState(tmpState);
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.auth_register_two;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          tmpState.toconfirmation = true;
          if (tmpState.response.status === 0){
            tmpState.toconfirmation = false;
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            tmpState.formKey = "step_three";
          }
          this.setState(tmpState);
          //recaptchaEm.componentDidMount();
          console.log("Ajax response:", result);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
          console.log("Ajax error:", error);
        }
      );

  }

  


  render() {

    window.history.pushState({}, null, "/register");

    var msgCn = "";
    if ("response" in this.state){
      if ("messagecn" in this.state.response){
        msgCn = (<Messagecn messagecn={this.state.response.messagecn}/>);
      }
    }
    for (var i in registerFormOne["groups"]){
        for (var j in registerFormOne["groups"][i]["emlist"]){
          var emObj = registerFormOne["groups"][i]["emlist"][j];
          if (emObj.emid === "registerbtn_one"){
              emObj["onclick"] = this.handleRegisterOne;
          }
        }
    }
    for (var i in registerFormTwo["groups"]){
        for (var j in registerFormTwo["groups"][i]["emlist"]){
          var emObj = registerFormTwo["groups"][i]["emlist"][j];
          if (emObj.emid === "registerbtn_two"){
              emObj["onclick"] = this.handleRegisterTwo;
          }
        }
    }

    var formCnHash = {
      "step_one":(<div id={"register_step_one"} key={"register_step_one"}>
            <div id={"register_form"} key={"register_form"} className="leftblock "
              style={{width:"90%", margin:"40px 0px 0px 5%"}}>
              <Formeditor formClass={registerFormOne.class} formObj={registerFormOne}/>
            </div>
        </div>),
      "step_two":(<div id={"register_step_two"} key={"register_step_two"} >
            <div id={"register_form"} key={"register_form"} className="leftblock "
              style={{width:"90%", margin:"40px 0px 0px 5%"}}>
              <Formeditor formClass={registerFormTwo.class} formObj={registerFormTwo}/>
            </div>
          </div>),
      "step_three":(<div id={"register_step_two"} key={"register_step_two"} >
            <div id={"register_form"} key={"register_form"} className="leftblock "
              style={{width:"90%", margin:"40px 0px 0px 5%"}}>
              {msgCn}
            </div>
          </div>)
      };

    var cn = formCnHash[this.state.formKey];
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

export default Register;
