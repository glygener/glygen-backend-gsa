import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Nav from './nav';
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import dashboardObjList from "../json/dashboard.json";


class Dashboard extends Component {
  state = {
    user_id:"",
    loginforward:false,
    formKey:"step_one",
    formCnHash:{},
    record:{},
    pageid:"dashboard",
    navinfo:{
      dashboard:[
            {id:"home", label: "Dashboard", url: "/dashboard"}
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


    var divList = [];
    for (var i in dashboardObjList){
      var obj = dashboardObjList[i];
      divList.push(
        <Link to={obj.url} key={"link_" + i} >
          <div id={obj.id} key={"td_"+i} className="leftblock appbox">
              {obj.labelone}<br/>{obj.labeltwo}
          </div>
        </Link>
      );
    }
   
    var cn = (
      <div className="leftblock" id="cmpcn" style={{width:"60%",margin:"40px 20% 0px 20%" }} >
        {divList}
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

export default Dashboard;
