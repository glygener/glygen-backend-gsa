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


  dumpFormValues(k) {
    for (var i in formHash[k]["groups"]){
      for (var j in formHash[k]["groups"][i]["emlist"]){
        var emObj = formHash[k]["groups"][i]["emlist"][j];
        console.log("DUMP", emObj.emid, emObj.value)
      }
    }

  }



  processForm() {

    var tmpState = this.state;
    tmpState.formCnHash = {};
    for (var k in formHash){
      for (var i in formHash[k]["groups"]){
        for (var j in formHash[k]["groups"][i]["emlist"]){
          var emObj = formHash[k]["groups"][i]["emlist"][j];
          if (emObj.emtype === "button"){
            var f = (emObj.value === "Back" ? this.handleBack : this.handleNext);
            formHash[k]["groups"][i]["emlist"][j]["onclick"] = f;
          }
          var emId = emObj.emid;
          if (emId in tmpState.record){
              if (["text", "int"].indexOf(emObj.emtype) !== -1){
                emObj.value =  tmpState.record.emId;
              }
              else if (emObj.emtype === "select"){
                emObj.selected = tmpState.record.emId;
              }
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


  handleBack = () => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var tmpState = this.state;
    if (["step_two_glycan", "step_two_glycoprotein"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_one";
    }
    else if (["step_three_source"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_two_" + tmpState.record["molecule"].toLowerCase();
    }
    else if (["step_four_metadata"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_three_source";
    }
    
    this.setState(tmpState);
  }


  handleNext = () => {

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
              if (fieldName === emObj.emid){ 
                if (emObj.emtype === "select"){
                  emObj.value.selected = fieldValue;
                }
                else{
                  emObj.value = fieldValue;
                }
              }
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
    
    //alert("before: " + tmpState.formKey);
    if (["step_one"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_two_" + tmpState.record["molecule"].toLowerCase();
    }
    else if (["step_two_glycan", "step_two_glycoprotein"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_three_source";
    }
    else if (["step_three_source"].indexOf(tmpState.formKey) !== -1){
      tmpState.formKey = "step_four_metadata";
    }
    //alert("after: " + tmpState.formKey);


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
    this.dumpFormValues(this.state.formKey);
    
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
