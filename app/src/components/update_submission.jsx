import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import Nav from './nav';
import Formeditor from "./form_editor";
import formHash from "../json/form_updatesubmissions.1.json";
import extraObjList from "../json/form_updatesubmissions.2.json";
import dataModel from "../json/data_model.json";
import {validateGlycoctSequence} from './util';


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
      "Other Glycoconjugate":["glycoprotein", "glycopeptide", "glycolipid", "gpi"]
    }




class Updatesubmission extends Component {
  state = {
    pageid:"update_submission",
    loginforward:false,
    saved:false,
    dialog:{
      status:false, 
      msg:""
    },
    navinfo:{
      update_submission:[
        {id:"dashboard", label: "Dashboard", url: "/dashboard"},
        {id:"submissions", label: "My Submissions", url: "/submissions"},
        {id:"update_submission", label: "Update (GSA_ID)", url: "/update_submission/GSA_ID"}
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
        }
      );
  }

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  handleAddItemObj = (e) => {
    var k = e.target.id.split("^")[0];
    var jqClass = ".submissionsform";
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
    var kParts = k.split("|");
    var targetObj = tmpState.record[kParts[0]];
    if (kParts.length > 1){
      for (var q=1; q < kParts.length; q++){
        if (kParts[q] in targetObj){
            targetObj = targetObj[kParts[q]];
        }
      }
    }
    
    var seen = {};
    for (var i in targetObj){
      var str = JSON.stringify(targetObj[i]);
      seen[str] = true;
    }
    if (!(JSON.stringify(o) in seen)){
      targetObj.push(o);
    }

    this.setState(tmpState);
    //this.updateForm();
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
    var seen = {};
    for (var i in targetObj){
      var str = targetObj[i];
      seen[str] = true;
    }
    if (!(val in seen)){
      targetObj.push(val);
    }


    this.setState(tmpState);
    //this.updateForm();
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
    //this.updateForm();
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
    //this.updateForm();
  }


  handleSaveChanges = (e) => {
    
    var updateObj = this.state.record;
    var jqClass = ".submissionsform";
    var valHash = {};
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        var fParts = fieldName.split("|");
        var targetObj = updateObj;
        for (var j=0; j < fParts.length -1; j++){
          var f = fParts[j];
          if (!(f in targetObj)){
            targetObj[f] = {}
          }
          targetObj = targetObj[f];
        }
        var lastField = fParts[fParts.length-1];
        if (["start_pos", "end_pos"].indexOf(lastField) != -1){
          fieldValue = parseInt(fieldValue);
        }
        targetObj[lastField] = fieldValue;
    });
    delete updateObj.gsa_id;

    var tmpState = this.state;
    delete tmpState.record;
    this.setState(tmpState);



    let access_csrf = localStorage.getItem("access_csrf")
    var reqObj = {"gsa_id":this.props.gsaId, update_obj:updateObj};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };


    const svcUrl = LocalConfig.apiHash.gsa_update;
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
          if (result.status == 1){
            tmpState.record = result.record;
            tmpState.saved = true;
          }
          console.log("response:", result);
          this.setState(tmpState);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );

  }
  


  handleSelectorChange = (e) => {
    
    var emObj = document.getElementById(e.target.id);
    var tmpState = this.state;
    tmpState.record[e.target.id] = emObj.value; 
   
    if (e.target.id === "glycoconjugate_type"){
      for (var i in filterHashThree[emObj.value]){
        var sec = filterHashThree[emObj.value][i];
        tmpState.record[sec] = {};
      }
    }
    this.setState(tmpState);
    //this.updateForm();
  }



  updateForm() {

    var seen = {};
    for (var j in formHash["glycan"]["groups"][0]["emlist"]){
      var emObj = formHash["glycan"]["groups"][0]["emlist"][j];
      seen[emObj.emid] = true;
    }

    if (this.state.record.glycan.sequence_type === "GlycoCT"){
      if (!("validatebtn" in seen)){
        formHash["glycan"]["groups"][0]["emlist"].push(extraObjList[0]);
      }
    }
    else{
      var tmpList = [];
      for (var j in formHash["glycan"]["groups"][0]["emlist"]){
        var emObj = formHash["glycan"]["groups"][0]["emlist"][j];
        if (["validatebtn", "validation"].indexOf(emObj.emid) === -1){
          tmpList.push(emObj)
        }
      }
      formHash["glycan"]["groups"][0]["emlist"] = tmpList;
    }
    

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
        
          if ("onclick" in emObj){
            emObj.onclick = eval(emObj.onclick);
          }
          if ("onchange" in emObj){
            emObj.onchange = eval(emObj.onchange);
          }


          if (emObj.emtype === "objlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemObj;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemObj;
            emObj.value =  recordValue;
          }
          else if (emObj.emtype === "stringlist"){
            formHash[k]["groups"][i]["emlist"][j]["onadditem"] = this.handleAddItemValue;
            formHash[k]["groups"][i]["emlist"][j]["onremoveitem"] = this.handleRemoveItemValue;
            emObj.value =  recordValue;
          }

        }
      }
    }
  }

  handleRetrieveSequence = () => {

    var jqClass = ".submissionsform";
    var valHash = {};
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        if (fieldValue.trim() !== ""){
          valHash[fieldName] = fieldValue;
        }
    });
   
    if (!("glycan|glytoucan_ac" in valHash) || !("glycan|sequence_type" in valHash)){ 
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = "Please entery GlyTouCan accession and sequence format";
      this.setState(tmpState);
    }
    var glytoucanAc = valHash["glycan|glytoucan_ac"];
    var seqFormat = valHash["glycan|sequence_type"];


    var reqObj = {"glytoucan_ac":glytoucanAc, "format":seqFormat};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.gsa_getseq;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          tmpState.loginforward = "msg" in result;
          //var emObj = document.getElementById("glycan|sequence");
          //emObj.value = result.sequence;
          tmpState.record.glycan.sequence = result.sequence;

          tmpState.record.glycan.sequence_type = seqFormat ;
          console.log("xxxx", tmpState.record);
          console.log("Retrieveseq", result);
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



  handleValidateSequence = () => {
    
    var glycoctSeq = this.state.record.glycan.sequence;
    var seen = {};
    for (var j in formHash["glycan"]["groups"][0]["emlist"]){
      var emObj = formHash["glycan"]["groups"][0]["emlist"][j];
      seen[emObj.emid] = true;
    }
    var tmpState = this.state;
    extraObjList[1].value = (<Loadingicon/>);
    if (!("validation" in seen)){
      formHash["glycan"]["groups"][0]["emlist"].push(extraObjList[1]);
    }
    this.updateForm();
    this.setState(tmpState);
    validateGlycoctSequence(glycoctSeq).then(resObj => {
      var tmpState = this.state;
      var len = formHash["glycan"]["groups"][0]["emlist"].length;
      var emObj = formHash["glycan"]["groups"][0]["emlist"][len-1];
      emObj.value = JSON.stringify(resObj, null, 2);
      this.updateForm();
      this.setState(tmpState);
    });
  }



  handleValidateSequenceOld = () => {
    var seen = {};
    for (var j in formHash["glycan"]["groups"][0]["emlist"]){
      var emObj = formHash["glycan"]["groups"][0]["emlist"][j];
      seen[emObj.emid] = true;
    }
    
    var svcUrl = LocalConfig.apiHash.glycoct_validate;
    var tmpState = this.state;
    extraObjList[1].value = (<Loadingicon/>);
    if (!("validation" in seen)){
      formHash["glycan"]["groups"][0]["emlist"].push(extraObjList[1]);
    }
    this.updateForm();
    this.setState(tmpState);



    var glycoctSeq = this.state.record.glycan.sequence;
    svcUrl += "?glycoct=" + glycoctSeq;
    svcUrl += "&type=N&enz=false&related=false&debug=false";
    
    fetch(svcUrl, {}).then((res) => res.json()).then(
      (result) => {
        var resObj = result;
        var valObj = {"errors":[], "rule_violations":[]};
        var errList = [];
        var vList = [];
        if ("error" in resObj){
          for (var i in resObj["error"]){
            var o = resObj["error"][i];
            valObj["errors"].push(o.message);
          }
        }
        if ("rule_violations" in resObj){
          for (var i in resObj["rule_violations"]){
            var o = resObj["rule_violations"][i];
            valObj["rule_violations"].push(o.assertion);
          }
        }
        valObj["errors"] = (valObj["errors"].length > 0 ? valObj["errors"] : 
          ["no errors found"]);
        valObj["rule_violations"] = (valObj["rule_violations"].length > 0 ? 
          valObj["rule_violations"] : ["no rule violations found"]);
        
        var tmpState = this.state;
        var len = formHash["glycan"]["groups"][0]["emlist"].length;
        var emObj = formHash["glycan"]["groups"][0]["emlist"][len-1];
        emObj.value = JSON.stringify(valObj, null, 2);
        this.updateForm();
        this.setState(tmpState);
      },
      (error) => { this.setState({isLoaded: true, error,});}
    );

    return;
  }


  render() {


    if(this.state.loginforward === true){
      window.location.href = "/login";
    }

    if (!("record" in this.state)){
      return <Loadingicon/>
    }
    var recordObj = this.state.record;
    this.updateForm();

    //cnList.push(<pre>{JSON.stringify(recordObj, null, 4)}</pre>);
    var cnList = [];


    for (var k in formHash){
      if (this.state.record["evidence_type"] in filterHashOne){
        var tmpList = filterHashOne[this.state.record["evidence_type"]];
        if (tmpList.indexOf(k) != -1){
          continue;
        }
      }
      if (this.state.record["data_source_type"] in filterHashTwo){
        var tmpList = filterHashTwo[this.state.record["data_source_type"]];
        if (tmpList.indexOf(k) != -1){
          continue;
        }
      }
      if (this.state.record["glycoconjugate_type"] in filterHashThree){
        var tmpList = filterHashThree[this.state.record["glycoconjugate_type"]];
        if (tmpList.indexOf(k) != -1){
          continue;
        }
      }
      cnList.push(<Formeditor formClass={formHash[k].class} formObj={formHash[k]}/>);
    }

    var cn = cnList;
    if (this.state.saved){
      cn = (<div className="leftblock" style={{padding:"40px 0px 0px 20px", color:"green"}}>
        Changes have been saved successfully!
      </div>);

      var tmpState = this.state;
      tmpState.saved = false;
    }
    var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
    
    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} navParamInfo={this.state.navparaminfo}/>
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          <div key={randStr} className="leftblock" style={{margin:"30px 0px 0px 4%"}}> 
            {cn}
          </div>
        </div>
      </div>

  );

  }
}

export default Updatesubmission;


