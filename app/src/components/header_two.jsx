import React, { Component } from "react";
//import Navbar from 'navbar-react'
//import { Container} from 'react-containers';
import { Form, FormControl, Container, Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import Searchbox from "./search_box";
import Usericon from "./user_icon";
import {getLogoutResponse} from "./util";



class HeaderTwo extends Component {


  handleKeyPress = (e) => {
    if(e.key === "Enter"){
      e.preventDefault();
      this.handleSearch();
    }
  }

  handleSearch = () => {

  }
  
  handleUserIcon = () => {

  }

  handleLogout = () => {  
    getLogoutResponse().then(result => { 
      if (result.status === 1){
        window.location.href = "/";
      }
    });
  }



  render() {


    var idList = ["portal", "data", "api", "sparql", "gsa"];
    var pageId = window.location.href.split("/")[3];
    pageId = (pageId.trim() === "" ? "home" : pageId);
    var sOne = {color:"#999", display:"block", float:"right", margin:"5px 5px 5px 40px",
      padding:"0px",
    };
    var sTwo = {color:"#333", display:"block", float:"right", margin:"5px 5px 5px 40px",
      padding:"0px",};
    var sThree = {color:"#333", display:"block", float:"right", margin:"5px 5px 5px 0px",
      textAlign:"right", padding:"0px"};
    var headerLinks = [];
    for (var i in this.props.initObj.headerlinks){
      var obj = this.props.initObj.headerlinks[i];
      if (idList.indexOf(obj.id) === -1){
        var s = (obj.id === pageId ? sOne : sTwo);
        headerLinks.push(
          <Nav.Link id={"link_" +obj.id} key={"link_" + obj.id} href={obj.url} style={s}>
            {obj.label}
          </Nav.Link>
        );
      }
    }
    if (this.props.userinfo !== undefined){
      headerLinks.push(
        <span id={"link_xx"} key={"link_xx"} style={sTwo}>
            {this.props.userinfo.email}
        </span>
      );
      headerLinks.push(
        <Nav.Link id={"link_xx"} key={"link_xx"} href={"#"}
          onClick={this.handleLogout} style={sThree}>
        | Logout
        </Nav.Link>
      );
    }
    else{
      var s = ( pageId === "login" ? sOne : sTwo);
      headerLinks.push(
        <Nav.Link id={"link_xx"} key={"link_xx"} href={"/login"} style={s}>
            Login
        </Nav.Link>
      );
    }


    headerLinks = headerLinks.reverse();
    
    var sOne = {width:"90%", margin:"20px 5% 0px 5%", padding:"10px 15px 20px 20px", border:"1px solid #ccc", 
      borderRadius:"5px"};
    var sTwo = {fontSize:"25px", color:"DodgerBlue", fontWeight:"bold", 
      margin:"30px 0px 0px 0px"};
    var sThree = {width:"50%"};
    var sFour = {width:"50%"};
    return (
      <div className="leftblock" style={sOne}>
        <div className="leftblock" style={sTwo}>
          {this.props.moduleTitle}
        </div>
        <div className="rightblock" style={sFour}>
          {headerLinks} 
        </div>  
        <div className="rightblock" style={sThree}>
          <Searchbox label={""} onSearch={this.handleSearch} onKeyPress={this.handleKeyPress}/>
        </div>

      </div>
    );
  }
}

export default HeaderTwo;
