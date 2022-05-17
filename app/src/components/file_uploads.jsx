import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Chart } from "react-google-charts";

import $ from "jquery";


class FileUploads extends Component {
  
  state = {
    loginforward:true,
    confirmation:"",
    viewstatus:0,
    tabidx:"failedrows",
    cn:"",
    dialog:{
      status:false, 
      msg:""
    }
  };


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    tmpState.viewstatus = 0;
    $("#tabcn").css("display", "none");
    this.setState(tmpState);
  }

  handleTitleClick = (e) => {
    var tmpState = this.state;
    tmpState.tabidx = e.target.id.split("-")[0];
    this.setState(tmpState);
  };


  handleGlycanFinder = () => {

    var reqObj = {"filename":this.state.response.inputinfo.name};
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_glycan_finder;
  

    const s = "width:40%;margin:20px 30% 40px 30%";
    var tmpCn = '<img src="' + process.env.PUBLIC_URL + '/imglib/loading.gif" style="'+s+'">';
    $("#glycan_finder_results_cn").html(tmpCn);
    $("#run_glycan_finder").html("");


    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.isLoaded = true;
          tmpState.response = result;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
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




  handleFileSubmit = () => {

    var reqObj = {"fname":"", "lname":"", "email":"", "affilation":""};
    for (var f in reqObj){
      reqObj[f] = $('#'+f).val();
    }
    reqObj["filename"] = this.state.response.inputinfo.name;
 
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_submit;

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
          this.setState(tmpState);
          $("#submitcn").html(result.confirmation);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );

  }



  handleFileUpload = () => {
    
    var file = $('#userfile')[0].files[0];
    var fileFormat = $('#formatselector').val();
    var qcType = $('#qcselector').val();
    var dataVersion = $('#dataversion').val();

    var formData = new FormData();
    formData.append("userfile", file);
    formData.append("format", fileFormat);
    formData.append("qctype", qcType);
    formData.append("dataversion", dataVersion);
    
    var tmpState = this.state;
    tmpState.viewstatus = 1;
    this.setState(tmpState);


    var sizeLimit = 1000000000;
    if (file.size > sizeLimit){
        var msg = 'Your submitted file is ' + file.size + ' Bytes big. ';
        msg += 'This exceeds maximum allowed file size of ' + sizeLimit + ' Bytes.';
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = msg;
        this.setState(tmpState);
        return;
    }
   
    const requestOptions = { 
      method: 'POST', 
      body: formData
    };
    const svcUrl = LocalConfig.apiHash.dataset_upload;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.viewstatus = 2;
          tmpState.isLoaded = true;
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          if (["png", "jpeg"].indexOf(tmpState.response.inputinfo.format) !== -1){
            tmpState.tabidx = "glycanfinder";
          }
          this.setState(tmpState);
          console.log("Ajax response:", result);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );

  }




  render() {

    var cn = "";
    if (this.state.loginforward === true){
      window.location.href = "/login";
    }
    else{
      cn = "xxx";
    }

    return (
      <div className="pagecn" style={{border:"0px dashed red", zIndex:100}}>
      <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
      {cn}
      </div>
    );
  }
}

export default FileUploads;

