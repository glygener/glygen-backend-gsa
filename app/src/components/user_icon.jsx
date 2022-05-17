import React, { Component } from "react";
import $ from "jquery";



class Usericon extends Component {

  handleIcon = (e) => {
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  $("#menudiv").toggle();
  }


  render() {

    var divList = [];
    var s = {width:"40%",height:"80px", margin:"10px 30% 10px 30%"};
    divList.push(
      <div key="userdiv_1" className="leftblock" style={s}>  
      <img alt="" src={process.env.PUBLIC_URL + '/zulaimglib/user_pic.png'} 
        style={{width:"100%", height:"100%"}} />   
      </div>
    );

    s = {width:"90%", margin:"0px 5% 0px 5%", textAlign:"center",
      fontSize:"16px"};
    divList.push(
      <div key="userdiv_2" className="leftblock" style={s}> 
          {this.props.userinfo.fname} {this.props.userinfo.lname}<br/>
          {this.props.userinfo.email}
      </div>
    );

    s = {width:"90%", margin:"30px 5% 30px 5%", textAlign:"center"};
    divList.push(
      <div key="userdiv_3" className="leftblock" style={s}> 
          <button className="btn btn-outline-secondary"
            onClick={this.props.handleLogout}
          >Sign out </button>
      </div>
    );

   

    return (
      <div>
      <span onClick={this.handleIcon} className="material-icons globalheader_apps_icon">person_pin</span>
      <div id="menudiv" 
      style={{display:"none", padding:"10px", position:"fixed", top:"40px", right:"2%",background:"#fff", width:"264px",  border:"1px solid #ccc", borderRadius:"10px"}}> 
      {divList}
      </div>
      </div>
    );

  }
}

export default Usericon;


