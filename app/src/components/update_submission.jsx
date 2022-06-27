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
    record:{},
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
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
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





  render() {

    if (!("response" in this.state)){
      return <Loadingicon/>
    }
    var recordObj = this.state.response.record;
    //cnList.push(<pre>{JSON.stringify(recordObj, null, 4)}</pre>);
    var cnList = [];
    for (var k in formHash){
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


