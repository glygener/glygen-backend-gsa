import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import $ from "jquery";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";


class Recordview extends Component {
  state = {
    record:{},
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.gsa_detail;

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





  render() {

    if (!("response" in this.state)){
      return <Loadingicon/>
    }

    var obj = this.state.response.record;
    var imgUrl = "https://image.glycosmos.org/snfg/png/" + obj.glycan.glytoucan_ac;
    var tmpList = [];
    tmpList.push(<div className="leftblock" style={{width:"90%"}}><b>GSA ID</b>: {obj.gsa_id}</div>);
    tmpList.push(<div className="leftblock"><img src={imgUrl} 
      style={{width:"70%"}}/></div>);
    
    tmpList.push(<div className="leftblock" style={{width:"90%", marginTop:"-40px"}}>
      <br/><br/><b>GLYCOCONJUGATE AND EVIDENCE TYPES</b><br/>
        <div className="leftblock" style={{width:"100%", marginLeft:"20px"}}>
          <b>Glycoconjugate Type</b>: {obj.glycoconjugate_type}<br/>
          <b>Evidence Type</b>: {obj.evidence_type}<br/>
          <b>Data Source Type</b>: {obj.data_source_type}<br/>
        </div>
      </div>);

    tmpList.push(<div className="leftblock" style={{width:"90%", marginTop:"40px"}}>
        <b>GLYCAN DETAILS</b><br/>
        <div className="leftblock" style={{width:"90%",marginLeft:"20px"}}>
          <b>GlyTouCan Accession</b>: {obj.glycan.glytoucan_ac}<br/>
          <b>Sequence Type</b>: {obj.glycan.sequence_type}<br/>
          <b>Sequence</b>: {obj.glycan.sequence}<br/>
          <b>GlycoTree Approved</b>: {obj.glycan.glycotree_approved}<br/>
        </div>
      </div>);

    tmpList.push(<div className="leftblock" style={{width:"90%", marginTop:"40px"}}>
      <b>BIOLOGICAL SOURCE</b><br/>
        <div className="leftblock" style={{width:"90%",marginLeft:"20px"}}>
          <b>Organism</b>: {obj.biological_source.tax_name}<br/>
          <b>Taxonomy ID</b>: {obj.biological_source.tax_id}<br/>
        </div>
      </div>);

    tmpList.push(<div className="leftblock" style={{width:"90%", marginTop:"40px"}}>
      <b>PUBLICATION</b><br/>
      </div>);


    for (var i in obj.publication){
      tmpList.push(
        <div className="leftblock" style={{width:"90%", marginBottom:"20px"}}>
          <div className="leftblock" style={{width:"90%",marginLeft:"20px"}}>
            <b>Type</b>: {obj.publication[i].type}<br/>
            <b>ID</b>: {obj.publication[i].id}<br/>
            <b>Title</b>: {}<br/>
            <b>Author(s)</b>: {}<br/>
          </div>
        </div>
      );
    }

    tmpList.push(
      <div className="leftblock" style={{width:"90%"}}>
        <br/><br/><b>ENTRY HISTORY</b><br/>
        <div className="leftblock" style={{marginLeft:"20px"}}>
          <b>Created</b>: {obj.createdts}<br/>
          <b>User</b>: {obj.user_id}<br/>
        </div>
      </div>
    );

    
    var sOne = { width:"100%",margin:"20px 0px 0px 20px", padding:"20px",
      border:"0px solid #ccc", borderRadius:"10px"};
    return (
      <div>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          <div className="leftblock" style={sOne}> 
            {tmpList}
          </div>
      </div>

  );

  }
}

export default Recordview;


