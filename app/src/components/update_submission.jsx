import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import Nav from './nav';

import Formeditor from "./form_editor";
import formHash from "../json/form_updatesubmissions.json";
import dataModel from "../json/data_model.json";



class Updatesubmission extends Component {
  state = {
    pageid:"update_submission",
    dialog:{
      status:false, 
      msg:""
    },
    navinfo:{
      update_submission:[
        {id:"dashboard", label: "Dashboard", url: "/dashboard"},
        {id:"update_submission", label: "Update Submission (GSA_ID)", url: "/update_submission/GSA_ID"}
      ]
    },
    navparaminfo:{"gsa_id":this.props.gsaId}
  };


  componentDidMount() {
    
    let access_csrf = localStorage.getItem("access_csrf")
    var reqObj = {"gsa_id":this.props.gsaId};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.gsa_detail;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.isLoaded = true;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          tmpState.loginforward = "msg" in result;
          tmpState.record = result.record;
          this.setState(tmpState);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
          //console.log("Ajax error:", error);
        }
      );
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
    

    var kParts = k.split("|");
    var targetObj = tmpState.record[kParts[0]];
    if (kParts.length > 1){
      for (var q=1; q < kParts.length; q++){
        if (kParts[q] in targetObj){
            targetObj = targetObj[kParts[q]];
        }
      }
    }
    targetObj.push(val);
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
   

    var kParts = k.split("|");
    var targetObj = tmpState.record[kParts[0]];
    if (kParts.length > 1){
      for (var q=1; q < kParts.length; q++){
        if (kParts[q] in targetObj){
            targetObj = targetObj[kParts[q]];
        }
      }
    }
    targetObj.splice(valueIdx, 1);
    this.setState(tmpState);
    this.updateForm();
  }




  updateForm() {

    for (var k in formHash){
      for (var i in formHash[k]["groups"]){
        for (var j in formHash[k]["groups"][i]["emlist"]){
          var emObj = formHash[k]["groups"][i]["emlist"][j];
          var emId = emObj.emid;
          var emIdParts = emObj.emid.split("|");
          var recordValue = this.state.record;
          for (var q in emIdParts){
            if (emIdParts[q] in recordValue){
              recordValue = recordValue[emIdParts[q]];
            }
          }
          if (["string", "number"].indexOf(typeof(recordValue)) != -1){
            if (emObj.emtype === "select"){
                emObj.value.selected = recordValue;
            }
            else{
              emObj.value =  recordValue;
            }
          }
          
          if (emObj.emtype === "objlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemObj;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemObj;
          }
          else if (emObj.emtype === "stringlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemValue;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemValue;
            emObj.value =  recordValue;
            console.log("XXXX", emId, emObj.value);
          }

        }
      }
    }
  }




  render() {

    if (!("record" in this.state)){
      return <Loadingicon/>
    }
    var recordObj = this.state.record;
    this.updateForm();

    //cnList.push(<pre>{JSON.stringify(recordObj, null, 4)}</pre>);
    var cnList = [];

    var filterHashOne = {
      "Biological":["expression_system"],
      "Recombinant expressed":[],
      "Synthetic":["biological_source", "expression_system"],
      "Computational":["biological_source", "expression_system"],
    };

    var filterHashTwo = {
      "Both":[],
      "Paper":["database_reference"],
      "Database":["experimental_data", "experimental_method"]
    };
   
    var filterHashThree = {
      "Glycan":["glycoprotein", "glycopeptide", "glycolipid", "gpi", "other_glycoconjugate"],
      "GlycoProtein":["glycopeptide", "glycolipid", "gpi", "other_glycoconjugate"],
      "GlycoPeptide":["glycoprotein", "glycolipid", "gpi", "other_glycoconjugate"],
      "GlycoLipid":["glycoprotein","glycopeptide","gpi", "other_glycoconjugate"],
      "GPI":["glycoprotein","glycopeptide","glycolipid","other_glycoconjugate"],
      "Other glycoconjugate":["glycoprotein", "glycopeptide", "glycolipid", "gpi"]
    }


    for (var k in formHash){
      var tmpList = filterHashOne[this.state.record["evidence_type"]];
      if (tmpList.indexOf(k) != -1){
        continue;
      }
      var tmpList = filterHashTwo[this.state.record["data_source_type"]];
      if (tmpList.indexOf(k) != -1){
        continue;
      }
      var tmpList = filterHashThree[this.state.record["glycoconjugate_type"]];
      if (tmpList.indexOf(k) != -1){
        continue;
      }
      
      cnList.push(<div key={"form_div"+k} className="leftblock">
          <Formeditor formClass={formHash[k].class} formObj={formHash[k]}/>
        </div>);
    }


    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} navParamInfo={this.state.navparaminfo}/>
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          <div className="leftblock" style={{margin:"30px 0px 0px 4%"}}> 
            {cnList}
          </div>
        </div>
      </div>

  );

  }
}

export default Updatesubmission;


