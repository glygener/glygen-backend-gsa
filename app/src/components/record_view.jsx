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

    var sOne = {width:"96%", marginTop:"10px", padding:"20px", background:"#f1f1f1",
      border:"1px solid #ccc", borderRadius:"10px"};

    var obj = this.state.response.record;
    var imgUrl = "https://image.glycosmos.org/snfg/png/" + obj.glycan.glytoucan_ac;
    var tmpList = [];
    tmpList.push(<div className="leftblock" style={sOne}>
      <b>GSA ID</b>: {obj.gsa_id}<br/>
      <div className="leftblock"><img src={imgUrl} style={{width:"70%"}}/></div>
      </div>); 

    obj.data_source_type = (obj.data_source_type === "Both" ? "Database & Paper" : obj.data_source_type);
    tmpList.push(<div className="leftblock" style={sOne}>
      <b>SUBMISSION AND EVIDENCE TYPES</b><br/>
        <div className="leftblock" style={{width:"100%", marginLeft:"20px"}}>
          <b>Submission Type</b>: {obj.glycoconjugate_type}<br/>
          <b>Evidence Type</b>: {obj.evidence_type}<br/>
          <b>Data Source Type</b>: {obj.data_source_type}<br/>
        </div>
      </div>);

    obj.glycan.glytoucan_ac = (obj.glycan.glytoucan_ac === "" ? "N/A" : obj.glycan.glytoucan_ac);
    tmpList.push(<div className="leftblock" style={sOne}>
        <b>GLYCAN DETAILS</b><br/>
        <div className="leftblock" style={{width:"90%",marginLeft:"20px"}}>
          <b>GlyTouCan Accession</b>: {obj.glycan.glytoucan_ac}<br/>
          <b>Sequence Type</b>: {obj.glycan.sequence_type}<br/>
          <b>Sequence</b>: {obj.glycan.sequence}<br/>
          <b>GlycoTree Approved</b>: {obj.glycan.glycotree_approved}<br/>
        </div>
      </div>);

    obj.biological_source.tax_name = (obj.biological_source.tax_name === "" ? "N/A" : obj.biological_source.tax_name);
    obj.biological_source.tax_id = (obj.biological_source.tax_id === 0 ? "N/A" : obj.biological_source. tax_id);
    tmpList.push(<div className="leftblock" style={sOne}>
      <b>BIOLOGICAL SOURCE</b><br/>
        <div className="leftblock" style={{width:"90%",marginLeft:"20px"}}>
          <b>Organism</b>: {obj.biological_source.tax_name}<br/>
          <b>Taxonomy ID</b>: {obj.biological_source.tax_id}<br/>
        </div>
      </div>);

    var urlHash = {
        "PubMed":"https://pubmed.ncbi.nlm.nih.gov/",
        "DOI":"https://doi.org/"
    };

    var subList = [];
    for (var i in obj.publication){
      var url = urlHash[obj.publication[i].type] + obj.publication[i].id;
      var link = (<a href={url} target="_">{obj.publication[i].id}</a>);
      subList.push(<li>{obj.publication[i].type}: {link}</li>);
    }
    if (subList.length === 0){
      subList.push(<li>N/A</li>);
    }

    tmpList.push(<div className="leftblock" style={sOne}>
      <b>PUBLICATION</b><br/>
        <ul>{subList}</ul>
      </div>);

    obj.createdts = (obj.createdts === "" ? "N/A" : obj.createdts);
    obj.modifiedts = (obj.modifiedts === "" ? "N/A" : obj.modifiedts);
    obj.modifiedts = (obj.modifiedts === undefined ? "N/A" : obj.modifiedts);
    
    tmpList.push(
      <div className="leftblock" style={sOne}>
        <b>ENTRY HISTORY</b><br/>
        <div className="leftblock" style={{marginLeft:"20px"}}>
          <b>Created On</b>: {obj.createdts}<br/>
          <b>Last Update</b>: {obj.modifiedts}<br/>
          <b>User</b>: {obj.user_id}<br/>
        </div>
      </div>
    );
    console.log(obj);
    
    var sTwo = { width:"100%",margin:"0px 0px 0px 20px", padding:"20px",
      border:"0px solid #ccc", borderRadius:"10px"};
    return (
      <div>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          <div className="leftblock" style={sTwo}> 
            {tmpList}
          </div>
      </div>

  );

  }
}

export default Recordview;


