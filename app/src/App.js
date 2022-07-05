import React, { Component } from "react";
import SearchResults from "./components/search_results";
import StaticPage from "./components/static_page";
import Alertdialog from './components/dialogbox';
import Loadingicon from "./components/loading_icon";
import * as LocalConfig from "./components/local_config";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HeaderOne from "./components/header_one";
import HeaderTwo from "./components/header_two";
import Footer from "./components/footer";
import Login from "./components/login";
import Register from "./components/register";
import Detail from "./components/detail";

import Dashboard from "./components/dashboard";
import Newsubmission from "./components/new_submission";
import Updatesubmission from "./components/update_submission";
import Deletesubmission from "./components/delete_submission";
import Submission from "./components/submissions";
import Updateprofile from "./components/update_profile";
import Changepassword from "./components/change_password";
import Resetpassword from "./components/reset_password";


class App extends Component {

  state = {
    dialog:{
      status:false, 
      msg:""
    }
  };



  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  componentDidMount() {
    this.getInit();
    this.getUserInfo();

  }

  getUserInfo () {
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
          tmpState.userinfo = result;
          tmpState.isLoaded = true;
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

  getInit() {
    var reqObj = {};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObj)
    };

    const svcUrl = LocalConfig.apiHash.gsa_init;
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
          //console.log("Request:",svcUrl);
          console.log("getInit response:", result);
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
    
    if (!("response" in this.state)){
      return <Loadingicon/>
    }
    if (!("userinfo" in this.state)){
      return <Loadingicon/>
    }

    var app_ver = process.env.REACT_APP_APP_VERSION;
    var data_ver = this.state.response.record.dataversion;
    var moduleTitle = "Glycan Structure Archive (GSA)"
    var userInfo = ("msg" in this.state.userinfo ? undefined : this.state.userinfo);

    return (
      <div>
      <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
      <HeaderOne onSearch={this.handleSearch} onKeyPress={this.handleKeyPress} initObj={this.state.response.record} module={"gsa"}/>
      <HeaderTwo moduleTitle={moduleTitle} appVer={app_ver} 
        initObj={this.state.response.record}
        userinfo={userInfo}
      />
      <Router>
        <Switch>
          <Route
            path="/dashboard"
            render={(props) => (
              <Dashboard userinfo={userInfo}/>
            )}
          />
          <Route
            path="/update_profile"
            render={(props) => (
              <Updateprofile userinfo={userInfo}/>
            )}
          />
          <Route
            path="/change_password"
            render={(props) => (
              <Changepassword userinfo={userInfo}/>
            )}
          />
          <Route
            path="/reset_password"
            render={(props) => (
              <Resetpassword/>
            )}
          />
          <Route
            path="/register"
            render={(props) => (
              <Register/>
            )}
          />
          <Route
            path="/login"
            render={(props) => (
              <Login/>
            )}
          />
          <Route
            path="/new_submission"
            render={(props) => (
              <Newsubmission pageId={"new_submission"} userinfo={userInfo}/>
            )}
          />
          <Route
            path="/update_submission/:gsaId"
            render={(props) => (
              <Updatesubmission pageId={"update_submission"} gsaId={props.match.params.gsaId}  
                userinfo={userInfo}/>
            )}
          />
          <Route
            path="/delete_submission/:gsaId"
            render={(props) => (
              <Deletesubmission pageId={"delete_submission"} gsaId={props.match.params.gsaId}
               userinfo={userInfo}/>
            )}
          />
          <Route
            path="/submissions"
            render={(props) => (
              <Submission pageId={"submissions"} userinfo={userInfo}/>
            )}
          />
          <Route
            path="/static/:pageId"
            render={(props) => (
              <StaticPage pageId={props.match.params.pageId}  />
            )}
          />
          <Route
            path="/detail/:gsaId"
            render={(props) => (
              <Detail gsaId={props.match.params.gsaId}/>
            )}
          />
          <Route
            exact
            path="/"
            render={(props) => (
              <SearchResults  />
            )}
          />
        </Switch>
      </Router>
      <Footer />
      </div>
    );

    
  }
}

export default App;
