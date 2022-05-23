import $ from "jquery";
import React from 'react';
import { Link } from "react-router-dom";
import * as LocalConfig from "./local_config";
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';






export function verifyReqObj (reqObj, formObj){
    var errorList = [];
    

    for (var i in formObj.groups){
      var grpObj = formObj.groups[i];
      for (var j in grpObj.emlist){
        var obj = grpObj.emlist[j];
        var emId = obj.emid;
        var emValue =  obj.value;
        if(!(emId in reqObj) === true){
          if (obj.emtype !== "button"){
            errorList.push(<li>field "{emId}" missing in request</li>);
          }
        }
        else if (reqObj[emId].toString() === "" ){
          errorList.push(<li key={"error_in_" + emId}>field "{emId}" cannot be empty value</li>);
        }
        else if (typeof(reqObj[emId]) !== obj["datatype"] ){
          alert(typeof(reqObj[emId]));
          errorList.push(<li>field "{emId}" type mismatch</li>);
        }
      }
      if (errorList.length === 0){
        return errorList;
      }
      console.log(errorList);
    }

    return (<ul> {errorList} </ul>);
}

export function getStarList(starCount){

  var starList = [];
  for (var j =1; j <= 5; j++){
    var fg = (j <= starCount ? "#F5B041" : "#cccccc");
    var s = {cursor:"pointer",marginRight:"1px",fontSize:"15px", color:fg};
    starList.push(<i key={"s_"+j} className="material-icons" style={s}>star </i>)
  }
  return starList;
}


export function filterObjectList(objList, filterList) {

    var retObj = {filterinfo:{}, passedobjlist:[]};
    for (var i in objList) {
      var obj = objList[i];
      var passCount = 0;
      for (var name in obj.categories) {
        if (["tags","protein"].indexOf(name) !== -1){
          continue;
        }
        var value = obj.categories[name].toLowerCase(); 
        var combo = name + "|" + value;
        if (!(name in retObj.filterinfo)) {
            retObj.filterinfo[name] = {};
        }
        if(true){
            if (!(value in retObj.filterinfo[name])){
              retObj.filterinfo[name][value] = 1;
            }
            else{
              retObj.filterinfo[name][value] += 1;
            }
        }
        if (filterList.indexOf(combo) !== -1) {
          passCount += 1;
        }
      }
      //if (passCount === this.state.filterlist.length){
      if (filterList.length > 0) {
        if (passCount > 0) {
            retObj.passedobjlist.push(obj);
        }
      } else {
        retObj.passedobjlist.push(obj);
      }
    }

    return retObj;
}



export function shortText(txt, txtLen) {
  var shortText = "";
  var parts = txt.split(" ");
  for (var j in parts) {
    if (shortText.length < txtLen) {
      shortText += parts[j] + " ";
    } else {
      shortText += " ...";
      break;
    }
  }
  return shortText;
}



export function rndrSearchResults(objList, startIdx, endIdx) {
  
  if (objList.length === 0){
    return (
    <div className="row" style={{color:"red", padding:"0px 0px 100px 20px"}}>
      No results found!
      </div>);
  }

  var cardList = [];
  for (var i=startIdx - 1; i <= endIdx -1;  i++){
    var obj = objList[i];
    var titleText = obj.name;

    cardList.push(
      <div className="leftblock" style={{width:"100%", background:"#fff", margin:"10px 0% 0px 0%"}}>
        <div className="leftblock" style={{width:"100%", padding:"15px"}}>
          {obj.glycan.glytoucan_ac}<br/>{obj.glycan.sequence}
        </div>
      </div>
    );
  }
  return (<div className="row">{cardList}</div>);
}



export function sortReleaseList(tmpList, reversedFlag){        

    var factorList = [10000, 1000, 1];
    var relDict = {};
    for (var i in tmpList){
        var rel = tmpList[i]
        var parts = (rel.indexOf(".") !== -1 ? rel.split(".") : rel.split("_"));
        var ordr = 0;
        for (var j in parts){
            ordr += factorList[j]*parseInt(parts[j]);
        }
        relDict[ordr] = rel;
    }

    var releaseList = [];
    var keyList = Object.keys(relDict).sort().reverse();
    for (var i in keyList){
        var ordr = keyList[i];
        releaseList.push(relDict[ordr]);
    }
    
    return releaseList;

}

export function rndrMiniTable(inObj){

  var s = "";
  var rowList = [];
  var cellList = [];
  for (var j in inObj["headers"]){
    s = {textAlign:"center",fontWeight:"bold",padding:"5px 0px 0px 0px", border:"1px solid #ccc"};
    cellList.push(<td key={"cell_"+j} style={s}>{inObj["headers"][j]}</td>);
  }
  rowList.push(<tr style={{height:"30px"}}>{cellList}</tr>);
  for (var i =0; i < inObj["content"].length; i ++){
    cellList = [];
    for (var j in inObj["content"][i]){
      s = {textAlign:"center",padding:"5px 0px 0px 0px", border:"1px solid #ccc"};
      cellList.push(<td key={"cell_"+i+j} style={s}>{inObj["content"][i][j]}</td>);
    }
    rowList.push(<tr key={"row_"+i} style={{height:"30px"}}>{cellList}</tr>);
  }
  s = {width:"100%",fontSize:"16px",border:"1px solid #ccc"};
  return (
    <table style={s} align="center" cellSpacing="1">
      <tbody>{rowList}</tbody>
    </table>
  );
}






export function getFormElement(pathId, formObj,formClass, emValue){

  pathId = pathId.replace(".", "_");

  function handleAddListValue (targetId) {
    var boxJqId = "#" + targetId.replace("_addbtn", "_addbox");
    $(boxJqId).val("");
    var boxJqId = "#" + targetId.replace("_addbtn", "_btnsone");
    $(boxJqId).css("display", "none");
    $(".btnstwo").css("display", "none");
    var boxJqId = "#" + targetId.replace("_addbtn", "_btnstwo");
    $(boxJqId).css("display", "block");
  }

  function handleSubmitAddListValue (targetId) {
    var boxJqId = "#" + targetId.replace("_submitbtn", "_addbox");
    var v = $(boxJqId).val();
    $(boxJqId).toggle();
    $(".btnscn").toggle();
    var boxJqId = "#" + targetId.replace("_submitbtn", "_select");
    $(boxJqId).append("<option value=\"" + v + "\">" + v + "</option>");
  }

  function handleCancelAddListValue () {
    $(".btnscnone").css("display", "block");
    $(".btnscntwo").css("display", "none");
  }

  function handleRemoveListValue (targetId) {
    var boxJqId = "#" + targetId.replace("_delbtn", "_select") + ' option:selected';
    var selectedList = $(boxJqId).toArray().map(item => item.text);
    for (var i in selectedList){
      var v = selectedList[i];
      var jqId = "#" + targetId.replace("_delbtn", "_select") + " option[value='"+v+"']";
      $(jqId).remove();
    }
  }

  function handleRemoveObj () {
    alert("Hi there");
  }

  function handleChange (em) {

    var targetId = "";
    if (em !== undefined){
      targetId = em.target.id;
    }

    var emObj = document.getElementById(targetId);
    if (targetId === "password_one"){
      var descObj = document.getElementById("lbl_" +targetId);
      var pass = emObj.value;
      let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
      let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,    }))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))')
      if(strongPassword.test(pass)) {
        emObj.style.border = "1px solid green";
        descObj.style.color = "green";
        descObj.textContent = "(strong)";
      } else if(mediumPassword.test(pass)){
        emObj.style.border = "1px solid orange";
        descObj.style.color = "yellow";
        descObj.textContent = "(medium)";
      } else{
        emObj.style.border = "1px solid red";
        descObj.style.color = "red";
        descObj.textContent = "(weak)";
      }
    }
    //emObj.value = $("#" + targetId).val();


  }




  var basicTypeList = [
      "text","password","int", "float", "datetime","radio", "select", "textarea",
      "stringlist"
  ];

  var emType = formObj.emtype;
  var em = "";
  if (["text","password","int", "float", "datetime"].indexOf(emType) !== -1){
    var newType = (["int", "float"].indexOf(emType) !== -1 ? "number": emType);
    var em = [];
    em.push(
      <input tag={newType} key={pathId + "_" +newType +  "_input"}
        maxLength={formObj.maxlength}  id={pathId} type={formObj.emtype}
        className={"form-control " + formClass}
        onChange={handleChange}
        defaultValue={emValue || ''}
      />
    );
    if ("description" in formObj){
      em.push(
        <span id={"desc_"+pathId} style={{width:"100%", fontStyle:"italic"}}>
        {formObj.description}
        </span>
      );
    }
  }
  else if (emType === "button"){
    em = [];
    em.push(<button id={pathId} className={formObj.class} onClick={formObj.onclick}>{formObj.value}</button>);
  }
  else if (emType === "radio"){
    em = [];
    em.push(
      <input type={emType} tag={emType} key={pathId +"_radio"}
        className={formClass} id={pathId} value={emValue} name={formObj.name}
        checked={formObj.checked}
      />
    );
    em.push( <span style={{fontSize:"16px"}}>&nbsp;{formObj.label}<br/></span>);
    if ("description" in formObj){
      em.push(<div className="leftblock" id={"desc_"+pathId}
        style={{margin:"0 0 0 20px",width:"100%", fontStyle:"italic"}}>
        {formObj.description}</div>);
    }
  }
  else if (emType === "textarea"){
    em = (
      <textarea tag={emType} key={pathId +"_textarea"}
        maxLength={formObj.maxlength} id={pathId}
        className={"form-control " + formClass}
        defaultValue={emValue || ''}
      >
      </textarea>
    );
  }
  else if (emType === "select"){
    var optList = [];
    for (var j in emValue.optlist){
        const val = emValue.optlist[j].value;
        const lbl = emValue.optlist[j].label;
        const key = pathId + "_" + j + "_" + val + "_opt";
        optList.push(<option key={key} value={val}>{lbl}</option>);
    }
    em = (
        <select tag={emType} key={pathId + "_select"} id={pathId}
          className={"form-control " + formClass}
          defaultValue={emValue.selected || ''}
        >
          {optList}
        </select>
    );
  }
  else if (emType === "stringlist"){
    var sTwo = {width:"100%", textAlign:"left", fontSize:"12px"};
    var sThree = {margin:"0px", padding:"0px", fontSize:"12px", textDecoration:"none"};
    var tmpList = [];
    if(typeof(emValue) === "object"){
      tmpList = emValue;
    }
    em = (
      <div>
        <div key={pathId +"_divtwo"} className="leftblock" style={sTwo}>
          <select tag={emType} id={pathId + "_select"}
            className={"form-control " + formClass} multiple>
            {tmpList.map((val)  => (
              <option key={pathId + "_" + val + "_opt"} value={val}>{val}</option>))}
          </select>
        </div>
        <div key={pathId +"_divthree"} id={pathId + "_btnsone"} className="block btnscn btnscnone" style={sTwo}>
            <button id={pathId + "_addbtn"} className="btn btn-link" style={sThree}
                onClick={() => handleAddListValue(pathId+"_addbtn")}>
              <AddOutlinedIcon id={pathId + "_addicon"}  style={{color:"#2358C2"}}
                onClick={() => handleAddListValue(pathId+"_addbtn")}/>
            </button> |
            <button id={pathId + "_delbtn"} className="btn btn-link" style={sThree}
                onClick={() => handleRemoveListValue(pathId+"_delbtn")}>
              <RemoveOutlinedIcon id={pathId + "_delicon"} style={{color:"#2358C2"}}
                onClick={() => handleRemoveListValue(pathId+"_delbtn")}/>
            </button>
          </div>
          <div key={pathId +"_divfour"} id={pathId + "_btnstwo"} className="leftblock btnscn btnscntwo" style={{width:"100%", textAlign:"left", fontSize:"12px", display:"none"}}>
            <input id={pathId + "_addbox"}  type="text"
              className={"form-control " + formClass}
              style={{width:"100%",marginTop:"5px"}}/>
            <button id={pathId + "_submitbtn"} className="btn btn-link" style={sThree}
                onClick={() => handleSubmitAddListValue(pathId+"_submitbtn")} >Submit</button> |
            <button id={pathId + "_cancelbtn"} className="btn btn-link" style={sThree} onClick={handleCancelAddListValue}>Cancel</button>
          </div>
        </div>
      );
    }
    else if (emType === "obj"){
      var obj = emValue;
      var spanList = [];
      for (const j in formObj.proplist){
          var childFormObj = formObj.proplist[j];
          var childPropName = childFormObj.prop;
          var childPropValue = obj[childPropName];
          var childPropType = childFormObj.emtype;
          var childPathId = pathId + "." + childPropName;
          if(basicTypeList.indexOf(childPropType) !== -1){
            if (childPropType === "select"){
              childFormObj.value.selected = obj[childPropName];
              childPropValue =  childFormObj.value;
            }
            var tmpEm = getFormElement(childPathId,childFormObj, formClass, childPropValue);
            spanList.push(tmpEm);
          }
          else{
            spanList.push(
              <div key={childPathId + "_divvv"} className="leftblock"
              style={{width:"98%", margin:"10px 10px 10px 5px", padding:"10px"}}>
                {"exception: " + childPropName}<br/>{JSON.stringify(obj[childPropName])}<br/>
              </div>
            );
          }
      }
      em = (
        <div key={pathId + "_divone"} className="leftblock" style={{width:"100%", padding:"0px 10px 20px 10px",        marginBottom:"10px",border:"1px solid #ccc", borderRadius:"10px"}}>
        {spanList}
        </div>
      );
    }
    else if (emType === "objlist"){
      var sOne = {};
      sTwo = {};
      var typeMap = {};
      var childPropList = [];
      for (var i in formObj.proplist){
        const o = formObj.proplist[i];
        childPropList.push(o.prop);
        var childPathId = pathId  + "_" + o.prop;
        typeMap[childPathId] = o.emtype;
        if (o.emtype === "objlist"){
          for (var j in o.proplist){
            const oo = o.proplist[j];
            var grandChildPathId = childPathId + "_" + oo.prop;
            typeMap[grandChildPathId] = oo.emtype;
          }
        }
      }

      var divList = [];
      for (const i in emValue){
        //if (this.state.rmlist.indexOf(i) !== -1){continue;}
        obj = emValue[i];
        spanList = [];
        for (const j in childPropList){
          var childPropName = childPropList[j];
          var childPathId = pathId + "_" + i + "_" + j + "_" + childPropName;
          var childTypePath = pathId + "_" + childPropName;
          var childPropType = (childTypePath in typeMap ? typeMap[childTypePath] : "");
          if(basicTypeList.indexOf(childPropType) !== -1){
            childFormObj = formObj.proplist[j];
            childPropValue = obj[childPropName];
            if (childPropType === "select"){
              childFormObj.value.selected = childPropValue;
              childPropValue = childFormObj.value;
            }
            var tmpEm = getFormElement(childPathId,childFormObj, formClass, childPropValue);
            spanList.push(tmpEm);
          }
          else{
            sOne = { width:"98%", margin:"10px 10px 10px 5px", padding:"10px"};
            sTwo = {width:"100%", margin:"0px", padding:"10px", border:"1px solid #ccc", borderRadius:"10px"};
            spanList.push(
              <div key={childPathId + "_divvv"} className="leftblock" style={sOne}>
                {"exception: " + childPropName}<br/>{JSON.stringify(emValue[childPropName])}<br/>
              </div>
            );
          }
        }
        var objId = i + "_" + pathId;
        divList.push(
            <div key={objId + "_divone"} className="leftblock" style={{width:"100%", padding:"0px 10px 20px 10px", marginBottom:"10px",border:"1px solid #ccc", borderRadius:"10px"}}>
            <button key={objId + "_btn"} className="btn btn-link rightblock" id={objId}
                style={{color:"#2358C2", margin:"5px 0px 0px 0px",padding:"0px",
                textDecoration:"none"}}
                onClick={handleRemoveObj}> X
            </button>
            <div key={objId + "_divtwo"} className="leftblock" style={{width:"100%"}}>
            {spanList}
            </div>
            </div>);
      }
      em = (
        <div key={pathId + "_objlist_div_one"}  id={pathId + "_objlist_one"} className="leftblock" style={{width:"100%", fontSize:"12px",background:"#fff", marginTop:"0px"}}>
           {divList}
        </div>
      );
    }




  var sOuter = {width:"100%",  background:"#fff", padding:"5px", fontSize:"12px"};
  if ("style" in formObj){
    sOuter = formObj.style;
  }
  var sInner = { paddingRight:"5px", background:"#fff",  fontSize:"12px"};
  var passwordStrengthLbl = "";
  if (pathId === "password_one"){
    passwordStrengthLbl = <div id={"lbl_"+pathId} className="leftblock" style={sInner} >
      </div>;
  }
  var lblDiv = (<div className="leftblock" style={sInner} >{formObj.label} </div>);
  if (emType === "radio"){lblDiv = "";}
  return (
    <div className="leftblock" key={pathId +"_" + emType} style={sOuter}>
      {lblDiv} {passwordStrengthLbl} {em}
    </div>
  );
}



export async function getLoginDirectResponse  (loginForm)  {

  var reqObj = {};
  var jqClass = ".loginform";
  $(jqClass).each(function () {
      var fieldName = $(this).attr("id");
      var fieldValue = $(this).val();
      reqObj[fieldName] = fieldValue;
  });

  var errorList = verifyReqObj(reqObj, loginForm);
  if (errorList.length !== 0) {
    return {status:0, errorlist:errorList}
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqObj),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.auth_login_direct;

  const response = await fetch(svcUrl, requestOptions);
  var result = await response.json();
  if (!("status" in result)){
    return {status:0, errorlist:[<li>Invalid API response</li>]}
  }
  else if (result.status === 0){
    return {status:0, errorlist:[<li>{result.error}</li>]}
  }

  return result;
}


export async function getLoginOneResponse  (loginForm)  {

  var reqObj = {};  
  var jqClass = ".loginform";
  $(jqClass).each(function () {
      var fieldName = $(this).attr("id");
      var fieldValue = $(this).val();
      reqObj[fieldName] = fieldValue;
  });

  var errorList = verifyReqObj(reqObj, loginForm);
  if (errorList.length !== 0) {    
    return {status:0, errorlist:errorList}
  }
  
  const requestOptions = { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqObj),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.login_one;

  const response = await fetch(svcUrl, requestOptions);
  var result = await response.json();
  if (!("status" in result)){
    return {status:0, errorlist:[<li>Invalid API response</li>]}
  }
  else if (result.status === 0){
    return {status:0, errorlist:[<li>{result.error}</li>]}
  }
  
  return result;
}


export async function getLoginTwoResponse  (loginForm, email)  {
  var reqObj = {};
  var jqClass = ".loginform";
  $(jqClass).each(function () {
      var fieldName = $(this).attr("id");
      var fieldValue = $(this).val();
      reqObj[fieldName] = fieldValue;
  });
  
  var errorList = verifyReqObj(reqObj, loginForm);
  if (errorList.length !== 0) { 
    return {status:0, errorlist:errorList}
  }
  reqObj.email = email;

  const requestOptions = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reqObj),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.login_two;
  const response = await fetch(svcUrl, requestOptions);
  var result = await response.json();
  if (!("status" in result)){
    return {status:0, errorlist:[<li>Invalid API response</li>]}
  }
  else if (result.status === 0){
    return {status:0, errorlist:[<li>{result.error}</li>]}
  }

  return result;

}

export async function getLoginThreeResponse  (loginForm, email, sharedKey)  {
  var reqObj = {};
  var jqClass = ".loginform";
  $(jqClass).each(function () {
      var fieldName = $(this).attr("id");
      var fieldValue = $(this).val();
      reqObj[fieldName] = fieldValue;
  });

  var errorList = verifyReqObj(reqObj, loginForm);
  if (errorList.length !== 0) { 
    return {status:0, errorlist:errorList}
  }
  reqObj.email = email;
  reqObj.shared_key = sharedKey;
  const requestOptions = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reqObj),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.login_three;
  const response = await fetch(svcUrl, requestOptions);
  var result = await response.json();
  if (!("status" in result)){
    return {status:0, errorlist:[<li>Invalid API response</li>]}
  }
  else if (result.status === 0){
    return {status:0, errorlist:[<li>{result.error}</li>]}
  }

  return result;
}


export async function getLogoutResponse  ()  {
  
  const requestOptions = { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"logout":true}),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.auth_logout;
  const response = await fetch(svcUrl, requestOptions);
  const result = await response.json();
  return result;

}



export function verifyPasswords (passwordOne, passwordTwo) {

  var errorList = [];
  let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

  if (passwordOne.length < 8){
    errorList.push(<li>selected password is too short</li>);
  }
  else if (passwordOne !== passwordTwo){
    errorList.push(<li>submitted passwords do not match</li>);
  }
  else if (strongPassword.test(passwordOne) === false) {
    errorList.push(<li>password is not strong enough</li>);
  }

  return errorList;
}

