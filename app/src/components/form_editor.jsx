import React, { Component } from "react";
import { Markup } from 'interweave';
import {getFormElement} from './util';
import $ from "jquery";


class Formeditor extends Component {
  state = {
    formObj:this.props.formObj,
    rmlist:[]
  };

  handleRemoveObj = (e) => {
    const objIdx = e.target.id.split("_")[0];
    var tmpState = this.state;
    tmpState.rmlist.push(objIdx);
    this.setState(tmpState);
  };

  handleResetObj = (e) => {
    var tmpState = this.state;
    tmpState.rmlist = [];
    this.setState(tmpState);
  };







  render() {


    var emList = [];
    for (var i in this.state.formObj.groups){
      var grpObj = this.state.formObj.groups[i];
      emList[i] = [];
      for (var j in grpObj.emlist){
        var obj = grpObj.emlist[j];
        var emId = obj.emid;
        var emValue =  obj.value;
        if (obj.status !== "inactive"){
          var em = getFormElement(emId,obj,this.props.formClass, emValue);
          emList[i].push(em);
        }
      }
    }
        
    var divList = [];
    var formTitle = this.state.formObj.title;
    var formDesc = this.state.formObj.description;
    if ("title" in this.state.formObj){
          var s = {width:"100%", background:"#fff", fontWeight:"bold"};
          s = ("titlestyle" in this.state.formObj ? this.state.formObj.titlestyle : s);
          divList.push(<div className="leftblock" style={s}>
            <Markup content={formTitle}/>
          </div>);
    }
    if ("description" in this.state.formObj){
          divList.push(<div className="leftblock" style={{width:"100%", marginBottom:"20px"}}>
            <Markup content={formDesc}/>
            </div>);
    }

    for (var i in emList){
        var s = this.state.formObj.groups[i].style;
        divList.push(<div className="leftblock" style={s}>{emList[i]}</div>);
    }
      
    return(<div className="leftblock" style={{width:"100%"}}>{divList}</div>);
  }
}
  
  export default Formeditor;
