import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Nav from './nav';
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import Loadingicon from "./loading_icon";
import Recordview from "./record_view";


class Deletesubmission extends Component {
  state = {
    user_id:"",
    loginforward:false,
    pageid:"delete_submission",
    navinfo:{
      delete_submission:[
        {id:"dashboard", label: "Dashboard", url: "/dashboard"},
        {id:"delete_submission", label: "Delete Submission", url: "/delete_submission"}  
      ]
    },
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
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.gsa_detail;
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


  
  handleDeleteSubmission = () => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var reqObj = {"gsa_id":this.props.gsaId};
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
    const svcUrl = LocalConfig.apiHash.gsa_delete;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log("Ajax response:", result);
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status == 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = this.state.response.error;
          }
          else{
            window.location.href = "/submissions";
          }
          tmpState.loginforward = "msg" in result;
          this.setState(tmpState);
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

    var cnList = [];

    var s = {width:"100%", background:"#f1f1f1", padding:"10px", textAlign:"right"};
    cnList.push(<div className="leftblock" style={s}>
      <button className="btn btn-outline-secondary" onClick={this.handleDeleteSubmission}>Delete Submission</button>
      </div>);
    cnList.push(<Recordview gsaId={this.props.gsaId}/>);


    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} />
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          {cnList}
        </div>
      </div>


      
  );
    
  }
}

export default Deletesubmission;
