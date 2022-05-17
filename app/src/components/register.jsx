import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import registerForm from "../json/form_register.json";
import $ from "jquery";
import { verifyReqObj, verifyPasswords} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";



class Register extends Component {
  state = {
    recaptcha_token:"",
    navinfo_register:[
      {id:"register", label: "Register", url: "/register"}
    ],
    navinfo_confirmation:[
      {id:"register", label: "Register", url: "/register"},
      {id:"confirmation", label: "Confirmation", url: "/confirmation", flag:"disabled"},
    ],
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


  handleRegister = () => {

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    //var reqObj = {recaptcha_token: this.state.recaptcha_token, coll:"c_user", record:{} };
    var reqObj = {coll:"c_user", record:{} };

    var jqClass = ".registerform";
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        reqObj["record"][fieldName] = fieldValue;
        for (var i in registerForm.groups){
            for (var j in registerForm.groups[i].emlist){
              var emObj = registerForm.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
        $(this).val("");
    });

    var errorList = verifyReqObj(reqObj.record, registerForm);
    errorList = errorList.concat(verifyPasswords(reqObj.record["password_one"],reqObj.record["password_two"]));


    reqObj["record"]["password"] = reqObj["record"].password_one;
    delete reqObj["record"].password_one;
    delete reqObj["record"].password_two;
    
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      this.setState(tmpState);
    }
    

    //var tmpState = this.state;
    //tmpState.dialog.status = true;
    //tmpState.dialog.msg = <div>{JSON.stringify(reqObj, null, 2)}</div>;
    //this.setState(tmpState);



    
    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.auth_register;
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
  };




  render() {

    //registerForm["one"]["fname"]["value"] = "1111111";
    var formCn = (
      <div>
            <div key={"register_form"} className="leftblock " 
              style={{width:"90%", margin:"40px 0px 0px 5%"}}>
              <Formeditor formClass={registerForm.class} formObj={registerForm}/>
            </div>
            
            
            <div key={"login_btn"} className="leftblock " 
              style={{width:"20%", margin:"10px 0px 0px 5%"}}>
              <button className="btn btn-outline-secondary" onClick={this.handleRegister}>Submit to register</button>
            </div>
      </div>
    );

    var cn = formCn;
    var navInfo = this.state.navinfo_register;
    if ("response" in this.state){
      if (this.state.response.status === 1){
        navInfo = this.state.navinfo_confirmation;
        cn = (
          <div className="leftblock " 
            style={{width:"80%", margin:"50px 0px 20px 5%"}}>
            <Messagecn messagecn={this.state.response.messagecn}/>
          </div>
        );
      }
    }
      
    var navParamInfo = {};
    return (
      <div>

        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          {cn}
        </div>
      </div>


      
  );
    
  }
}

export default Register;
