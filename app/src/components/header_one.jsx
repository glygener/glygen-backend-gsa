import React, { Component } from "react";
//import Navbar from 'navbar-react'
//import { Container} from 'react-containers';
import { Form, FormControl, Container, Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';


class HeaderOne extends Component {

  


  render() {

    var navbarStyle =  { minHeight:"80px"}
    var server = process.env.REACT_APP_SERVER;
    if (server !== "prd"){
      navbarStyle.backgroundImage = 'url("/imglib/watermark.'+server+'.png")';
    }
    var urlDict = {
      "prd":{
        "portal":"https://glygen.org", 
        "data":"https://data.glygen.org",
        "api":"https://api.glygen.org",
        "sparql":"https://sparql.glygen.org"
        
      },
      "beta":{
        "portal":"https://beta.glygen.org",
        "data":"https://beta-data.glygen.org",
        "api":"https://beta-api.glygen.org",
        "sparql":"https://beta-sparql.glygen.org"
      },
      "tst":{
        "portal":"https://tst.glygen.org",
        "data":"https://data.tst.glygen.org",
        "api":"https://api.tst.glygen.org",
        "sparql":"https://sparql.tst.glygen.org"
      },
      "dev":{
        "portal":"https://dev.glygen.org",
        "data":"https://data.dev.glygen.org",
        "api":"https://api.dev.glygen.org",
        "sparql":"https://sparql.dev.glygen.org"
      }
    }

    var sOne = {color:"#ccc", height:"43px", margin:"0 30px 0px 0px", borderBottom:"2px solid #fff"};
    var sTwo = {color:"#fff", height:"43px",  margin:"0 30px 0px 0px"};
    var headerLinks = [];
    var idList = ["portal", "data", "api", "sparql", "gsa"];
    for (var i in idList){
      var linkId = idList[i];
      var s = (linkId === this.props.module ? sOne : sTwo);
      var url = urlDict[server][linkId]
      headerLinks.push(
        <Nav.Link id={"link_" +linkId} key={"link_" + linkId} href={url} 
            style={{fontWeight:"bold"}} style={s}>
          {linkId.toUpperCase()}
        </Nav.Link>
      );  
    }
    
   
    
    return (
      <Navbar className="globalheader"  variant="dark" expand="lg" 
        style={navbarStyle}
        >
        <Container fluid>
          <Navbar.Brand href="/" style={{fontSize:"30px"}}>
             <img alt="" src={process.env.PUBLIC_URL + '/imglib/logo-glygen.svg'} 
            style={{width:"100%"}} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ml-auto" navbarScroll style={{fontSize:"20px"}}>
              {headerLinks}
              <NavDropdown title="Modules" id="navbarScrollingDropdown"
                style={{display:"none"}}> 
                xxx
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default HeaderOne;
