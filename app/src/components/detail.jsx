import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import Nav from "./nav";
import Recordview from "./record_view";


class Detail extends Component {
  state = {
    record:{},
    pageid:"detail",
    navinfo:{
      detail:[
        {id:"home", label: "Home", url: "/"},
        {id:"detail", label: "Details View (GSA_ID)", url: "/detail/GSA_ID"},
      ]
    },
    navparaminfo:{gsa_id:this.props.gsaId}
  };


  render() {

    return (
      <div>
        <Nav navinfo={this.state.navinfo[this.state.pageid]} navParamInfo={this.state.navparaminfo}/>
        <div className="pagecn" style={{background:"#fff"}}>
          <Recordview gsaId={this.props.gsaId}/>
        </div>
      </div>

  );

  }
}

export default Detail;


