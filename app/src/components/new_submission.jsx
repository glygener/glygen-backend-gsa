import React, { Component } from "react";
import Formeditor from "./form_editor";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";

import Nav from './nav';
import $ from "jquery";
import { verifyReqObj, verifyPasswords, validateGlycoctSequence, validateUrl, validateTaxId} from './util';
import Messagecn from './message_cn';
import * as LocalConfig from "./local_config";
import formHash from "../json/form_submissions.json";
import dataModel from "../json/data_model.json";
import { Link } from "react-router-dom";


class Newsubmission extends Component {
  state = {
    user_id:"",
    loginforward:false,
    loadingicon:false,
    formKey:"step_one",
    formCnHash:{},
    record:{},
    pageid:"new_submission",
    navinfo:{
      new_submission:[
          {id:"dashboard", label: "Dashboard", url: "/dashboard"},  
          {id:"new_submission", label: "New Submission", url: "/new_submission"}
      ]
    },
    dialog:{
      status:false, 
      msg:""
    }
  };


  componentDidMount() {
    
    let access_csrf = localStorage.getItem("access_csrf")
    var reqObj = {};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.auth_userinfo;
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
          tmpState.user_id = result.email;
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



  getConfirmationCn() {
    var gsaId = this.state.response.record.gsa_id;
    var gsaLink = (<Link to={"/detail/" + gsaId }>{gsaId}</Link>);
    var msg = (<span>
      Record saved successfully! The GSA ID for this record is <b>{gsaLink}</b>
    </span>);
    return msg;
  }



  getSummaryCn () {
    var grpOne = ["glycan", "biological_source"];
    var grpTwo = [
      "user_id", "evidence_type", "data_source_type", "glycoconjugate_type",
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


    var secList = [
      "user_id","evidence_type", "data_source_type", "glycan", 
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
    return cn;

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
    var glytoucan_ac = valHash["glycan|glytoucan_ac"];
    var seq_format = valHash["glycan|sequence_type"];
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {"glytoucan_ac":glytoucan_ac, "format":seq_format};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.gsa_getseq;
    console.log("svcURL", svcUrl);
    console.log("reqObj", reqObj);
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
          var emObj = document.getElementById("glycan|sequence");
          emObj.value = result.sequence;
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



  handleSubmit = () => {  
   
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    let access_csrf = localStorage.getItem("access_csrf")
    var reqObj = {"record":dataModel};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.gsa_submit;

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
          var msg = this.getConfirmationCn();
          tmpState.record["confirmation|message"] = msg;
          this.updateForm();
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


  updateForm() {

    var tmpState = this.state;
    tmpState.formCnHash = {};
    for (var k in formHash){
      for (var i in formHash[k]["groups"]){
        for (var j in formHash[k]["groups"][i]["emlist"]){
          var emObj = formHash[k]["groups"][i]["emlist"][j];
          if (emObj.emtype === "button"){
            //var f = (emObj.value === "Back" ? this.handleBack : this.handleNext);
            emObj["onclick"] = eval(emObj.onclick);
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
              if (["text", "int", "objlist", "stringlist", "plaintext"].indexOf(emObj.emtype) != -1){
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
        if (fieldName !== "publication_last_type"){
          $(jqId).val("");
        }
      }
    });
 

    var tmpState = this.state;
    if (!(k in tmpState.record)){
      tmpState.record[k] = [];
    }
    var objList = tmpState.record[k];
    var seen = {};
    for (var i in objList){
      var str = JSON.stringify(objList[i]);
      seen[str] = true;
    }

    if (["publication", "xrefs"].indexOf(k) !== -1){
      var errorList = [];
      var urlHash = {
        "PubMed":"https://pubmed.ncbi.nlm.nih.gov/",
        "DOI":"https://doi.org/"
      }
      var url = urlHash[o.type] + o.id;
      url = (k === "xrefs" ? o.url : url); 
      validateUrl(url).then(errorList => {
        if (errorList.length > 0){
          tmpState.dialog.status = true;
          tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
          this.setState(tmpState);
        }
        else if (!(JSON.stringify(o) in seen)){
          objList.push(o);
          this.setState(tmpState);
          this.updateForm();
        }
      });
    }
    else{
      if (!(JSON.stringify(o) in seen)){
        objList.push(o);
        this.setState(tmpState);
        this.updateForm();
      }
    }
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
    var valList = tmpState.record[k];
    var seen = {};
    for (var i in valList){
      seen[valList[i]] = true;
    }
    if (!(val in seen)){
      valList.push(val);
    }


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
      tmpState.formKey = "step_three_all";
    }
    else if (tmpState.formKey.split("_")[1] === "five"){
      var x = tmpState.record["evidence_type"].split(" ")[0].toLowerCase();
      if (["biological", "recombinant"].indexOf(x) != -1){
        tmpState.formKey = "step_four_" + x;
      }
      else{
        var x = tmpState.record["glycoconjugate_type"].split(" ")[0].toLowerCase();
        tmpState.formKey = "step_two_" + x;
      }
    }
    else if (tmpState.formKey.split("_")[1] === "six"){
      var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_five_" + x;

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
                if (emObj.datatype.split("|")[1] === "int"){
                  fieldValue = parseInt(fieldValue);
                }
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
        //$(this).val("");
    });


    var errorList = verifyReqObj(valHash, selectedForm);
    errorList = errorList.concat(this.validateInput(valHash));
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      this.setState(tmpState);
      return;
    }




    var tmpState = this.state;
    if (tmpState.formKey === "step_one"){
      tmpState.record = {"user_id":this.state.user_id};
    }
    for (var f in valHash){
      tmpState.record[f] = valHash[f];
    }
    
    if (tmpState.formKey === "step_one"){
      var x = tmpState.record["glycoconjugate_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_two_" + x;
    }
    else if (tmpState.formKey.split("_")[1] === "two" && valHash["glycan|sequence_type"] === "GlycoCT"){
      tmpState.formKey = "step_three_all";
    }
    else if (tmpState.formKey.split("_")[1] === "two" || tmpState.formKey.split("_")[1] === "three"){
      var x = tmpState.record["evidence_type"].split(" ")[0].toLowerCase();
      if (["biological", "recombinant"].indexOf(x) != -1){
        tmpState.formKey = "step_four_" + x;
      }
      else{
        var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
        tmpState.formKey = "step_five_" + x;
      }
    }
    else if (tmpState.formKey.split("_")[1] === "four"){
      var x = tmpState.record["data_source_type"].split(" ")[0].toLowerCase();
      tmpState.formKey = "step_five_" + x;
    }
    else if (tmpState.formKey.split("_")[1] === "five"){
      tmpState.formKey = "step_six_all";
      var summary = this.getSummaryCn();
      tmpState.record["review|summary"] = summary;
      this.updateForm();
    }
    else if (tmpState.formKey === "step_six_all"){
      this.handleSubmit();
      tmpState.formKey = "step_seven_all";
    }
    this.setState(tmpState);
    return

  }



  validateInput = (valHash) => {



    var errorList = [];
    if (this.state.formKey === "step_two_glycoprotein"){
        var uniprotAc = valHash["glycoprotein|uniprotkb_ac"];
        var startPos = valHash["glycoprotein|site|start_pos"];
        var endPos = valHash["glycoprotein|site|end_pos"];
        const svcUrl = LocalConfig.apiHash.uniprotkb_entry + uniprotAc + ".json";
        const xhr = new XMLHttpRequest();
        xhr.open("GET", svcUrl, false);
        xhr.seqLen = 0;
        xhr.flag = false;
        xhr.uniprotAc = uniprotAc;  
        xhr.onreadystatechange = function() {//Call a function when the state changes.
          if(xhr.readyState == 4 && xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            xhr.seqLen = obj["sequence"]["length"];
            if (obj.primaryAccession === xhr.uniprotAc){
              xhr.flag = true;
            }
          }
        }
        xhr.send();
        if (xhr.flag === false){
          var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
          errorList.push(<li key={"error_" + randStr}>Invalid UniProtKB accession</li>);
        }
        if (startPos < 1 || endPos > xhr.seqLen){
          var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
          errorList.push(<li key={"error_" + randStr}>Site range outside of sequence length</li>);
        }
        if (startPos > endPos){
          var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
          errorList.push(<li key={"error_" + randStr}>Start position cannot be greater than end position</li>);
        }
    }
    else if (this.state.formKey === "step_two_glycopeptide"){
      var pepLen = valHash["glycopeptide|sequence"].length;
      var startPos = valHash["glycopeptide|site|start_pos"];
      var endPos = valHash["glycopeptide|site|end_pos"];
      if (startPos < 1 || endPos > pepLen){
        var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
        errorList.push(<li key={"error_" + randStr}>Site range outside of sequence length</li>);
      }
      if (startPos > endPos){
        var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
        errorList.push(<li key={"error_" + randStr}>Start position cannot be greater than end position</li>);
      }
      var aaListAll = "ARNDCQEGHILKMFPSTWYVX".split("");
      var aaList = valHash["glycopeptide|sequence"].toUpperCase().split("");
      for (var i=0; i < pepLen; i++){
        var aa = aaList[i];
        if (aaListAll.indexOf(aa) === -1){
           var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
          errorList.push(<li key={"error_" + randStr}>Invalid amino acid {aa}</li>);
        }
      }

    }
    else if (this.state.formKey === "step_four_biological"){
      var taxId = valHash["biological_source|tax_id"];
      this.handleValidateTaxId(taxId);
    }
    else if (this.state.formKey === "step_four_recombinant"){
      var taxId = valHash["expression_system|tax_id"];
      this.handleValidateTaxId(taxId);
    }

    if (this.state.formKey.indexOf("step_two") != -1 && valHash["glycan|sequence_type"] === "GlycoCT"){
      var tmpState = this.state;
      tmpState.loadingicon = true;
      this.setState(tmpState);
      var glycoctSeq = valHash["glycan|sequence"];
      validateGlycoctSequence(glycoctSeq).then(resObj => {
        var tmpState = this.state;
        //tmpState.record["validation"] = JSON.stringify(resObj, null, 2);
        tmpState.record["validation"] = resObj;
        tmpState.loadingicon = false;
        this.updateForm();
        this.setState(tmpState);
      });
    }
   
    //this.endLoadingIcon();

    return errorList;

  };



  handleValidateTaxId = (taxId) => {
      var tmpState = this.state;
      tmpState.loadingicon = true;
      this.setState(tmpState);
      validateTaxId(taxId).then(resObj => {
        var tmpState = this.state;
        if (resObj.status !== 1){
          tmpState.dialog.status = true;
          tmpState.dialog.msg = (<li>Invalid Tax ID: {taxId}</li>);
          tmpState.formKey = "step_four_biological";
        }
        tmpState.loadingicon = false;
        this.updateForm();
        this.setState(tmpState);
      });

    return;
  }


          



  render() {


    if (this.state.loadingicon === true){
      return <Loadingicon/>
    }

    if(this.state.loginforward === true){
      window.location.href = "/login";
    }


    var cn = this.state.formCnHash[this.state.formKey];
    
    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} />
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          {cn}
        </div>
      </div>


      
  );
    
  }
}

export default Newsubmission;
