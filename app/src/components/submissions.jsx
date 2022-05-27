import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import $ from "jquery";
import { verifyReqObj, verifyPasswords} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";

import formHash from "../json/form_submissions.json";
import dataModel from "../json/data_model.json";



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
    this.updateForm();

  }


  dumpFormValues(k) {
    for (var i in formHash[k]["groups"]){
      for (var j in formHash[k]["groups"][i]["emlist"]){
        var emObj = formHash[k]["groups"][i]["emlist"][j];
        console.log("DUMP", emObj.emid, emObj.value)
      }
    }

  }



  getSummaryCn () {
  
    var grpOne = ["glycan", "biological_source"];
    var grpTwo = [
      "evidence_type", "data_source_type", "glycoconjugate_type",
      "keywords", "xrefs", "experimental_method", "publication","experimental_data"
    ];
    var seen = {}
    for (var k in this.state.record){
      var parts = k.split("|");
      seen[parts[0]] = true;
      if (grpOne.indexOf(parts[0]) != -1){
        dataModel[parts[0]][parts[1]] = this.state.record[k];
      }
      else if (grpTwo.indexOf(parts[0]) != -1){
        dataModel[parts[0]] = this.state.record[k];
        if (dataModel["glycoconjugate_type"] === "Glycan"){
          dataModel["glycoconjugate_type"] = "";
        }
      }
      else if (parts[1] === "site"){
        dataModel[parts[0]]["site"][parts[2]] = parseInt(this.state.record[k]);
      }
      else if (["uniprotkb_ac", "sequence", "lipid_id"].indexOf(parts[1]) != -1){
        dataModel[parts[0]][parts[1]] = this.state.record[k];
      }
    }

    var tmpList = ["glycoprotein","glycopeptide", "glycolipid", "gpi", "other_glycoconjugate",
      "expression_system", "database_source"
    ];
    for (var i in tmpList){
      if (!(tmpList[i] in seen)){
        dataModel[tmpList[i]] = {}
      }
    }

    // <pre>{JSON.stringify(this.state.record, null, 4)}</pre>
    // <pre>{JSON.stringify(dataModel, null, 4)}</pre>

    var secList = [
      "evidence_type", "data_source_type", "glycan", 
      "glycoconjugate_type", "biological_source", 
      "glycoprotein", "glycopeptide", "glycolipid", "gpi",
      "keywords", "xrefs", "experimental_method",
      "publication","experimental_data"
    ];
   
    var secGrpOne = ["glycan", "biological_source", "glycoprotein", "glycopeptide",
      "glycolipid","gpi"];
    var secGrpTwo = ["xrefs", "publication","experimental_data"];
    var secGrpThree = ["keywords",  "experimental_method"];

    var cnList = [];
    for (var i in secList){
      var sec = secList[i];
      if (!(sec in seen)){
        continue;
      }
      if (secGrpOne.indexOf(sec) != -1){
        var tmpList = [];
        for (var k in dataModel[sec]){
          if (k === "site"){
            for (var q in dataModel[sec][k]){
              tmpList.push(<li><b>{k}_{q}</b>: {dataModel[sec][k][q]}</li>);
            }
          }
          else{
            tmpList.push(<li><b>{k}</b>: {dataModel[sec][k]}</li>);
          }
        }
        cnList.push(<li><b>{sec}</b>: <ul>{tmpList}</ul></li>);
      }
      else if (secGrpTwo.indexOf(sec) != -1){
        var tmpList = [];
        for (var i in dataModel[sec]){
          tmpList.push(<li>{JSON.stringify(dataModel[sec][i], null, 4)}</li>);
        }
        cnList.push(<li><b>{sec}</b>: <ul>{tmpList}</ul></li>);
      }
      else{
        cnList.push(<li><b>{sec}</b>: {JSON.stringify(dataModel[sec], null, 4)}</li>);
      }
    }
    var cn = (<ul>{cnList}</ul>);


    var ttlStyle = {"width":"90%", "margin":"40px 0px 15px 5%", "fontWeight":"bold"};
    var sOne = { width:"90%",margin:"15px 0px 0px 5%", padding:"20px 0px 0px 0px", 
      border:"1px solid #ccc", borderRadius:"10px"};
    var cn = (
      <div className="leftblock" style={{width:"100%"}}>
        <div className="leftblock" style={ttlStyle}>GSA Submission step 5 of 5 </div>
        <div className="leftblock" style={sOne}>
          {cn}<br/>
        </div>
      <div className="leftblock" style={{width:"90%", margin:"20px 0px 0px 5%"}}>
        <button id={"final_back"} className={"btn btn-outline-secondary"} 
            onClick={this.handleBack}>Back</button> &nbsp;
        <button id={"final_submit"} className={"btn btn-outline-secondary"}
            onClick={this.handleSubmit}>Submit</button>
      </div>
    </div>

    );

    return cn;
  }


  handleSubmit() {

  }


  updateForm() {

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
          if (emObj.emtype === "objlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemObj;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemObj;
          }
          else if (emObj.emtype === "stringlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemValue;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemValue;
          }
          var emId = emObj.emid;
          if (emId in tmpState.record){
              if (["text", "int", "objlist", "stringlist"].indexOf(emObj.emtype) != -1){
                emObj.value =  tmpState.record[emId];
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

  handleAddItemObj = (e) => {
    var k = e.target.id.split("^")[0];
    var selectedForm = formHash[this.state.formKey];
    var jqClass = "." + selectedForm.class;
    var o = {};
    $(jqClass).each(function () {
      var fieldName = $(this).attr("id");
      var fieldValue = $(this).val();
      if (fieldName.indexOf(k + "_last_") != -1){
        var p = fieldName.replace(k + "_last_", "");
        o[p] =  fieldValue;
        var jqId = "#" + fieldName;
        $(jqId).val("");
      }
    });
    var tmpState = this.state;
    if (!(k in tmpState.record)){
      tmpState.record[k] = [];
    }
    var objList = tmpState.record[k];
    objList.push(o);
    this.setState(tmpState);
    this.updateForm();
  }





  handleAddItemValue = (e) => {
    
    var k = e.target.id.split("^")[0];
    var jqId = "#" + k.replace("|", "_") + "_last";
    var val = $(jqId).val();
    $(jqId).val("");
    var tmpState = this.state;
    if (!(k in tmpState.record)){
      tmpState.record[k] = [];
    }
    var objList = tmpState.record[k].push(val);
    this.setState(tmpState);
    this.updateForm();
  }


  handleRemoveItemObj = (e) => {
    var k = e.target.id.split("^")[0];
    var objIdx = parseInt(e.target.id.split("^")[2]);

    var tmpState = this.state;
    var objList = tmpState.record[k];
    var newObjList = [];
    var tmpState = this.state;
    for (var i in objList){
        if (i != objIdx){
          newObjList.push(objList[i]);
        }
    }
    tmpState.record[k] = newObjList
    this.setState(tmpState);
    this.updateForm();
  }

  handleRemoveItemValue = (e) => {
    var k = e.target.id.split("^")[0];
    var valueIdx = parseInt(e.target.id.split("^")[1]);
    var tmpState = this.state;
    tmpState.record[k].splice(valueIdx, 1);
    this.setState(tmpState);
    this.updateForm();
  }



  handleBack = () => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var tmpState = this.state;

    if (tmpState.formKey.split("_")[1] === "two"){
      tmpState.formKey = "step_one";
    }
    else if (tmpState.formKey.split("_")[1] === "three"){
      var x = tmpState.record["glycoconjugate_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_two_" + x;
    }
    else if (tmpState.formKey.split("_")[1] === "four"){
      var x = tmpState.record["evidence_type"].split(" ")[0].toLowerCase();
      if (["biological", "recombinant"].indexOf(x) != -1){
        tmpState.formKey = "step_three_" + x;
      }
      else{
        var x = tmpState.record["glycoconjugate_type"].split(" ")[0].toLowerCase();
        tmpState.formKey = "step_two_" + x;
      }
    }
    else if (tmpState.formKey.split("_")[1] === "five"){
      var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_four_" + x;

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
        for (var i in selectedForm.groups){
            for (var j in selectedForm.groups[i].emlist){
              var emObj = selectedForm.groups[i].emlist[j];
              if (fieldName === emObj.emid){ 
                valHash[fieldName] = fieldValue;
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
    if (tmpState.formKey === "step_one"){
      tmpState.record = {};
    }
    for (var f in valHash){
      tmpState.record[f] = valHash[f];
    }
    
    if (tmpState.formKey === "step_one"){
      var x = tmpState.record["glycoconjugate_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_two_" + x;
    }
    else if (tmpState.formKey.split("_")[1] === "two"){
      var x = tmpState.record["evidence_type"].split(" ")[0].toLowerCase();
      if (["biological", "recombinant"].indexOf(x) != -1){
        tmpState.formKey = "step_three_" + x;
      }
      else{
        var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
        tmpState.formKey = "step_four_" + x;
      }
    }
    else if (tmpState.formKey.split("_")[1] === "three"){
      var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_four_" + x;
    }
    else if (tmpState.formKey.split("_")[1] === "four"){
      tmpState.formKey = "step_five";
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
    if (this.state.formKey === "step_five"){
      cn = this.getSummaryCn();
    }

    //this.dumpFormValues(this.state.formKey);
    
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
