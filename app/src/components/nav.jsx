import React, { Component } from "react";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
                       

class Nav extends Component {
  
  render() {


    var navParamInfo = this.props.navParamInfo;

    var inObj = {linkclass: "navlink", lastlinkclass: "navlinklast"};
    var n = this.props.navinfo.length;
    var linkList = [];
    for (var i in this.props.navinfo){
        var obj = this.props.navinfo[i];
        var secId = obj.id;
        var lbl = obj.label;
        for (var p in navParamInfo){
          lbl = lbl.replace(p.toUpperCase(), navParamInfo[p]);
          obj.url = obj.url.replace(p.toUpperCase(), navParamInfo[p]);
        }
        var cls = inObj.linkclass;
        cls = (i === n - 1 ? inObj.lastlinkclass : inObj.linkclass);
        if (obj.flag === "disabled"){
          linkList.push(
            <span key={"key1_"+secId} className={cls}>{obj.label}</span>
          )
        }
        else{
          linkList.push(
            <Link to={obj.url} key={secId} id={secId} className={cls}>
              {lbl}
            </Link>
          );
        }
        if (i < n - 1){
          linkList.push(
            <span key={"key3_"+secId}>
            &nbsp;/&nbsp;
            </span>
            )
        }
        i += 1;
    }

    return (
      <div className="navcn">
        > { linkList }
      </div>
    );
  }
}

export default Nav;

