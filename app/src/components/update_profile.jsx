import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Nav from './nav';
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import { verifyReqObj, setFormValues} from './util';
import Formeditor from "./form_editor";
import formHash from "../json/form_update_profile.json";
import Loadingicon from "./loading_icon";


class Updateprofile extends Component {
  state = {
    user_id:"",
    saved:false, 
    loginforward:false,
    pageid:"update_profile",
    navinfo:{
      update_profile:[
        {id:"dashboard", label: "Dashboard", url: "/dashboard"},
        {id:"update_profile", label: "Update Profile", url: "/update_profile"}  
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
    const svcUrl = LocalConfig.apiHash.auth_get_profile;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status == 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            tmpState.record = result.record;
          }
          tmpState.loginforward = "msg" in result;
          this.setState(tmpState);
          console.log("Ajax response:", result);
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


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }


  
  handleUpdateProfile = () => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {"updateobj":{}};
    var jqClass = ".pageform";
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        reqObj["updateobj"][fieldName] = fieldValue;
        for (var i in formHash.groups){
            for (var j in formHash.groups[i].emlist){
              var emObj = formHash.groups[i].emlist[j];
              if (fieldName === emObj.emid){ emObj.value = fieldValue;}
            }
        }
        //$(this).val("");
    });

    var errorList = verifyReqObj(reqObj["updateobj"], formHash);

    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      tmpState.formKey = "step_one"
      this.setState(tmpState);
      return;
    }

    let access_csrf = localStorage.getItem("access_csrf")
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.auth_update_profile;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status == 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            tmpState.record = result.record;
            tmpState.saved = true;
          }
          tmpState.loginforward = "msg" in result;
          this.setState(tmpState);
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
  }





  render() {


    if(this.props.userinfo == undefined || this.state.loginforward){
      window.location.href = "/login";
    }
    if (!("record" in this.state)){
      return <Loadingicon/>
    }

    setFormValues(formHash, this.state.record);

    for (var i in formHash["groups"]){
      for (var j in formHash["groups"][i]["emlist"]){
        var emObj = formHash["groups"][i]["emlist"][j];
        var emId = emObj.emid;
        if ("onclick" in emObj){
            emObj.onclick = eval(emObj.onclick);
        }
      }
    }
  

    var cn = (<Formeditor formClass={formHash.class} formObj={formHash}/>);
    if (this.state.saved){
      cn = (<div className="leftblock" style={{padding:"40px 0px 0px 20px", color:"green"}}>
        Changes have been saved successfully!
      </div>);
      var tmpState = this.state;
      tmpState.saved = false;
    }


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

export default Updateprofile;
