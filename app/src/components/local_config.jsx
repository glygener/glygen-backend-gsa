//import * as Zulamodule from "./module_exports";

export const apiHash = {
  gsa_init:process.env.REACT_APP_API_URL + "/gsa/init",
  gsa_search:process.env.REACT_APP_API_URL + "/gsa/search",
  gsa_recordlist:process.env.REACT_APP_API_URL + "/gsa/recordlist",
  gsa_detail:process.env.REACT_APP_API_URL + "/gsa/detail",
  gsa_upload:process.env.REACT_APP_API_URL + "/gsa/upload",
  gsa_submit:process.env.REACT_APP_API_URL + "/gsa/submit",
  gsa_update:process.env.REACT_APP_API_URL + "/gsa/update",
  gsa_static_content:process.env.REACT_APP_API_URL + "/gsa/pagecn",
  auth_register_one:process.env.REACT_APP_API_URL + "/auth/register_one",
  auth_register_two:process.env.REACT_APP_API_URL + "/auth/register_two",
  auth_login_direct:process.env.REACT_APP_API_URL + "/auth/login_direct",
  auth_logout:process.env.REACT_APP_API_URL + "/auth/logout",
  auth_userinfo:process.env.REACT_APP_API_URL + "/auth/userinfo",
  auth_change_password:process.env.REACT_APP_API_URL + "/auth/change_password",
  auth_reset_password:process.env.REACT_APP_API_URL + "/auth/reset_password"
};


