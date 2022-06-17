import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Nav from './nav';
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import { Chart } from "react-google-charts";


class Submissions extends Component {
  state = {
    loginforward:false,
    pageid:"submissions",
    user_id:"",
    tabledata:[],
    navinfo:{
      submissions:[
        {id:"dashboard", label: "Dashboard", url: "/dashboard"},
        {id:"submissions", label: "Exising Submissions", url: "/submissions"}  
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
          else{
            tmpState.user_id = result.email;
            this.getRecordList();
          }
          tmpState.loginforward = "msg" in result;
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


  getRecordList = () => {
    
    let access_csrf = localStorage.getItem("access_csrf")
    var reqObj = {"user_id":this.state.user_id};

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': access_csrf
      },
      body: JSON.stringify(reqObj),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.gsa_recordlist;
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
          else{
            tmpState.tabledata = result.tabledata;
          }
          tmpState.loginforward = "msg" in result;
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
      <div className="leftblock" style={{width:"100%", padding:"30px"}} >
        <Chart width={'100%'} chartType="Table" loader={<div>Loading Chart</div>} data={this.state.tabledata}
            options={
              { showRowNumber: false, width: '100%', height: '100%', page:'enable', pageSize:50,
                allowHtml:true, 
                cssClassNames:{ headerRow: 'googleheaderrow', tableRow:'googlerow',
                  oddTableRow:'googleoddrow', headerCell:'googleheadercell', tableCell:'googlecell'
                }
              }
            }
            rootProps={{ 'data-testid': '1' }}
        />
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

export default Submissions;
