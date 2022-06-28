import os,sys
from flask_restx import Namespace, Resource, fields
from flask import (request, current_app)
from gsa.document import get_one, get_many, insert_one, update_one, order_json_obj
from gsa.auth import get_userinfo

from werkzeug.utils import secure_filename
import datetime
import time
import subprocess
import json

from flask_jwt_extended import (
    jwt_required, jwt_refresh_token_required, get_jwt_identity
)



api = Namespace("gsa", description="Glycan APIs")

gsa_search_query_model = api.model(
    'GSA Search Query', 
    { 'query': fields.String(required=True, default="", description='Query string')}
)

gsa_recordlist_query_model = api.model(
    'GSA Record List Query',
    { 'user_id': fields.String(required=True, default="", description='User ID/Email')}
)

gsa_detail_query_model = api.model(
    'GSA Detail Query',
    {
        'bcoid': fields.String(required=True, default="GLY_000001", description='BCO ID'),
        'dataversion': fields.String(required=False, default="1.12.1", description='Dataset Release [e.g: 1.12.1]'),
    }
)

gsa_submit_query_model = api.model(
    'GSA Submit Query',
    {
    }
)


gsa_update_query_model = api.model(
    'GSA Update Query',
    {
        'gsa_id': fields.String(required=True, default="", description='GSA_ID'),
        'update_obj': fields.String(required=True, default="", description='Update Object')
    }
)

gsa_finder_query_model = api.model(
    'Glycan Finder Query',
    {
        'filename': fields.String(required=True, default="", description='File name')
    }
)

pagecn_query_model = api.model(
    'GSA Page Query',
    {
        'pageid': fields.String(required=True, default="faq", description='Page ID')
    }
)

init_query_model = api.model('Init Query',{})





@api.route('/search')
class GSAList(Resource):
    '''Search GSA database '''
    @api.doc('search')
    @api.expect(gsa_search_query_model)
    def post(self):
        '''Search GSA database'''
        req_obj = request.json
        req_obj["coll"] = "c_glycan"
        res_obj = get_many(req_obj)
        #xxx
        catObjListOne = [
            {"prop":"biological_source", "label":"Biological Source", "childprop":"tax_name"},
            {"prop":"expression_system", "label":"Expression System", "childprop":"tax_name"}
        ]
        catObjListTwo = [
            {"prop":"glycoprotein", "label":"Glycoprotein"},
            {"prop":"glycopeptide", "label":"Glycopeptide"},
            {"prop":"glycolipid", "label":"Glycolipid"},
            {"prop":"gpi", "label":"GPI"},
            {"prop":"other_glycoconjugate", "label":"Other"}
        ]
        for doc in res_obj["recordlist"]:
            doc["categories"] = {}
            for obj in catObjListOne:
                p, lbl, child_p = obj["prop"], obj["label"], obj["childprop"]
                if p in doc:
                    if child_p in doc[p]:
                        doc["categories"][lbl] = doc[p][child_p]
            for obj in catObjListTwo:
                p, lbl = obj["prop"], obj["label"]
                if p in doc:
                    if doc[p] != {}:
                        doc["categories"]["Glycoconjugate Type"] = lbl


        return res_obj


@api.route('/recordlist')
class GSARecordlist(Resource):
    '''Get list of GSA records created by a user'''
    @api.doc('recordlist')
    @api.expect(gsa_recordlist_query_model)
    def post(self):
        '''Get list of GSA records created by a user'''
        req_obj = request.json
        req_obj["coll"] = "c_glycan"
        gsa_obj = get_many(req_obj)
        if "error" in gsa_obj:
            return gsa_obj
        

        field_obj_list = [
            {"path":"gsa_id", "label":"GSA ID", "type":"string"},
            {"path":"glycan.glytoucan_ac", "label":"GlyTouCan AC", "type":"string"},
            {"path":"data_source_type", "label":"Data Source Type", "type":"string"},
            {"path":"evidence_type", "label":"Evidence Type", "type":"string"},
            {"path":"glycoconjugate_type", "label":"Glycoconjugate Type", "type":"string"},
            {"path":"createdts", "label":"Created On", "type":"string"},
            {"path":"createdts", "label":"", "type":"string"}
        ]

        res_obj = {"tabledata":[], "status":1}
        header_row = []
        for obj in field_obj_list:
            header_row.append({"label":obj["label"], "type":obj["type"]})
        res_obj["tabledata"].append(header_row)

        for doc in gsa_obj["recordlist"]:
            row = []
            for o in field_obj_list[:-1]:
                p_list = o["path"].split(".")
                val = ""
                for p in p_list:
                    val = doc[p] if p in doc else ""
                row.append(val)
            row.append("<a href=\"/update_submission/%s\">Update/Edit</a>" % (doc["gsa_id"]))
            res_obj["tabledata"].append(row)

        return res_obj


@api.route('/detail')
class GSADetail(Resource):
    '''Show a single gsa item'''
    @api.doc('detail')
    @api.expect(gsa_detail_query_model)
    def post(self):
        '''Get single gsa object'''
        req_obj = request.json

        req_obj["coll"] = "c_glycan"
        gsa_obj = get_one(req_obj)
        if "error" in gsa_obj:
            return gsa_obj

        #SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        #json_url = os.path.join(SITE_ROOT, "conf/config.json")
        #config_obj = json.load(open(json_url))
        res_obj = gsa_obj
        res_obj["status"] = 1

        return res_obj


@api.route('/pagecn')
class GSA(Resource):
    '''Get static page content '''
    @api.doc('pagecn')
    @api.expect(pagecn_query_model)
    def post(self):
        '''Get static page content '''
        req_obj = request.json
        req_obj["coll"] = "c_html"
        res_obj = get_one(req_obj)
        return res_obj




@api.route('/init')
class GSA(Resource):
    '''Get init '''
    @api.doc('init')
    @api.expect(init_query_model)
    def post(self):
        '''Get init '''
        req_obj = request.json
        req_obj["coll"] = "c_init"
        res_obj = get_one(req_obj)

        return res_obj





@api.route('/submit')
class GSA(Resource):
    '''Submit gsa '''
    @api.doc('submit')
    @api.expect(gsa_submit_query_model)
    @jwt_required
    def post(self):
        '''Submit gsa '''
        req_obj = request.json
        current_user = get_jwt_identity()
        user_info, err_obj, status = get_userinfo(current_user)
        if status == 0:
            return err_obj
        req_obj["useremail"] = current_user
        req_obj["coll"] = "c_glycan"
        res_obj = insert_one(req_obj)
        #res_obj["userinfo"] = user_info

        return res_obj



@api.route('/update')
class GSA(Resource):
    '''Update gsa '''
    @api.doc('update')
    @api.expect(gsa_update_query_model)
    @jwt_required
    def post(self):
        '''Update gsa '''
        req_obj = request.json
        current_user = get_jwt_identity()
        user_info, err_obj, status = get_userinfo(current_user)
        if status == 0:
            return err_obj
        req_obj["useremail"] = current_user
        qry_obj = {"gsa_id":req_obj["gsa_id"]}
        update_obj = req_obj["update_obj"]
        res_obj = update_one("c_glycan", qry_obj, update_obj);
        #res_obj["userinfo"] = user_info

        return res_obj





