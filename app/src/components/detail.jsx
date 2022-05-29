import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";



class Detail extends Component {
  state = {
    record:{},
    dialog:{
      status:false, 
      msg:""
    }
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

    var secList = [
      "gsa_id","createdts","user_id","evidence_type", "data_source_type", "glycan",
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
      if (secGrpOne.indexOf(sec) != -1){
        var tmpList = [];
        for (var k in recordObj[sec]){
          if (k === "site"){
            for (var q in recordObj[sec][k]){
              tmpList.push(<li><b>{k}_{q}</b>: {recordObj[sec][k][q]}</li>);
            }
          }
          else{
            tmpList.push(<li><b>{k}</b>: {recordObj[sec][k]}</li>);
          }
        }
        cnList.push(<li><b>{sec}</b>: <ul>{tmpList}</ul></li>);
      }
      else if (secGrpTwo.indexOf(sec) != -1){
        var tmpList = [];
        for (var i in recordObj[sec]){
          tmpList.push(<li>{JSON.stringify(recordObj[sec][i], null, 4)}</li>);
        }
        cnList.push(<li><b>{sec}</b>: <ul>{tmpList}</ul></li>);
      }
      else{
        cnList.push(<li><b>{sec}</b>: {JSON.stringify(recordObj[sec], null, 4)}</li>);
      }
    }

    //cnList.push(<pre>{JSON.stringify(recordObj, null, 4)}</pre>);
    var cn = (<ul>{cnList}</ul>);
    
    var sOne = { width:"100%",margin:"0px", padding:"20px",
      border:"0px solid #ccc", borderRadius:"10px"};
    return (
      <div>
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          <div className="leftblock" style={sOne}> 
            {cn}
          </div>
        </div>
      </div>

  );

  }
}

export default Detail;


