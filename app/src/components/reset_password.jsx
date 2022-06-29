import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import formHash from "../json/form_password_reset.json";
import $ from "jquery";
import { verifyReqObj, verifyPasswords} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";
import Nav from './nav';



class Resetpassword extends Component {

  state = {
    user_id:"",
    sent:false, 
    pageid:"reset_password",
    navinfo:{
      reset_password:[
        {id:"home", label: "Home", url: "/"},
        {id:"reset_password", label: "Reset Password", url: "/reset_password"}  
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



  handleResetPassword = () => {

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {};
    var jqClass = ".passwordresetform";
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        reqObj[fieldName] = fieldValue;
        for (var i in formHash.groups){
            for (var j in formHash.groups[i].emlist){
              var emObj = formHash.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
    });
    var errorList = verifyReqObj(reqObj, formHash);
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      tmpState.formKey = "step_one"
      this.setState(tmpState);
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.auth_reset_password;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status == 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            tmpState.sent = true;
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


  


  render() {

    for (var i in formHash["groups"]){
      for (var j in formHash["groups"][i]["emlist"]){
        var emObj = formHash["groups"][i]["emlist"][j];
        var emId = emObj.emid;
        if ("onclick" in emObj){
            emObj.onclick = eval(emObj.onclick);
        }
      }
    }

    var cn = (<Formeditor formClass={formHash.class} formObj={formHash}/>);
    if (this.state.sent){
      cn = (<div className="leftblock" style={{padding:"40px 0px 0px 20px", color:"green"}}>
        Temporary password has been sent to your email address.
      </div>);
      var tmpState = this.state;
      tmpState.sent = false;
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

export default Resetpassword;
