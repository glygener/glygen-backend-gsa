import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import $ from "jquery";
import { verifyReqObj, verifyPasswords} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";

import formHash from "../json/form_submissions.json";



class Submissions extends Component {
  state = {
    formKey:"step_one",
    formCnHash:{},
    record:{},
    dialog:{
      status:false, 
      msg:""
    }
  };


  componentDidMount() {
    this.processForm();

  }

  processForm() {

    var tmpState = this.state;
    tmpState.formCnHash = {};
    for (var k in formHash){
      for (var i in formHash[k]["groups"]){
        for (var j in formHash[k]["groups"][i]["emlist"]){
          var emObj = formHash[k]["groups"][i]["emlist"][j];
          if (emObj.emtype === "button"){
            var f = (emObj.value === "Cancel" ? this.handleCancel : this.handleSubmit);
            formHash[k]["groups"][i]["emlist"][j]["onclick"] = f;
          }
        }
      }
      tmpState.formCnHash[k] = (
        <div key={"form_div"+k} className="leftblock "
          style={{width:"90%", margin:"40px 0px 0px 5%"}}>
          <Formeditor formClass={formHash[k].class} formObj={formHash[k]}/>
        </div>
      );
    }
    this.setState(tmpState);

  }

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

  handleCancel = () => {
  }


  handleSubmit = () => {

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    //var reqObj = {recaptcha_token: this.state.recaptcha_token, coll:"c_user", record:{} };
    var reqObj = {coll:"c_glycan", record:{} };
    var selectedForm = formHash[this.state.formKey];

    var jqClass = ".submissionsform";
    var valHash = {};
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        valHash[fieldName] = fieldValue;
        for (var i in selectedForm.groups){
            for (var j in selectedForm.groups[i].emlist){
              var emObj = selectedForm.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
        $(this).val("");
    });

    var errorList = verifyReqObj(valHash, selectedForm);
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      this.setState(tmpState);
    }

    var tmpState = this.state;
    for (var f in valHash){
      tmpState.record[f] = valHash[f];
    }
    tmpState.formKey = "step_two_" + valHash["molecule"].toLowerCase();

    //tmpState.dialog.status = true;
    //tmpState.dialog.msg = <div>{JSON.stringify(tmpState.record, null, 2)}</div>;
    this.setState(tmpState);
    return



    
    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.auth_submissions;
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

    var cn = this.state.formCnHash[this.state.formKey];

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

export default Submissions;
