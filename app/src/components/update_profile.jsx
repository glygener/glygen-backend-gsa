import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Nav from './nav';
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";


class Updateprofile extends Component {
  state = {
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
    
  }


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }





  render() {

    if(this.state.loginforward === true){
      window.location.href = "/login";
    }

    var cn = ( 
      <div className="leftblock" style={{width:"100%", padding:"30px" }} >
        Page for {this.state.pageid} coming soon!
      </div>
    );

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
