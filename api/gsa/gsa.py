import os,sys
from flask_restx import Namespace, Resource, fields
from flask import (request, current_app)
from gsa.document import get_one, get_many, insert_one, order_json_obj
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
    'Dataset Search Query', 
    {
        'query': fields.String(required=True, default="", description='Query string')
    }
)


gsa_detail_query_model = api.model(
    'Dataset Detail Query',
    {
        'bcoid': fields.String(required=True, default="GLY_000001", description='BCO ID'),
        'dataversion': fields.String(required=False, default="1.12.1", description='Dataset Release [e.g: 1.12.1]'),
    }
)


gsa_submit_query_model = api.model(
    'Dataset Submit Query',
    {
        'fname': fields.String(required=True, default="", description='First name'),
        'lname': fields.String(required=True, default="", description='Last name'),
        'email': fields.String(required=True, default="", description='Email address'),
        'affilation': fields.String(required=True, default="", description='Affilation')
    }
)

gsa_finder_query_model = api.model(
    'Glycan Finder Query',
    {
        'filename': fields.String(required=True, default="", description='File name')
    }
)

pagecn_query_model = api.model(
    'Dataset Page Query',
    {
        'pageid': fields.String(required=True, default="faq", description='Page ID')
    }
)

init_query_model = api.model('Init Query',{})



ds_model = api.model('Dataset', {
    'id': fields.String(readonly=True, description='Unique record identifier'),
    'title': fields.String(required=True, description='Dataset title')
})


@api.route('/search')
class DatasetList(Resource):
    '''f dfdsfadsfas f '''
    @api.doc('search_gsas')
    @api.expect(gsa_search_query_model)
    #@api.marshal_list_with(ds_model)
    def post(self):
        '''Search gsas'''
        req_obj = request.json
        req_obj["coll"] = "c_glycan"
        res_obj = get_many(req_obj)
        
        return res_obj


@api.route('/detail')
class DatasetDetail(Resource):
    '''Show a single gsa item'''
    @api.doc('get_gsa')
    @api.expect(gsa_detail_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get single gsa object'''
        req_obj = request.json

        req_obj["coll"] = "c_glycan"
        gsa_obj = get_one(req_obj)
        if "error" in gsa_obj:
            return gsa_obj

        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "conf/config.json")
        config_obj = json.load(open(json_url))
        res_obj = gsa_obj
        res_obj["status"] = 1

        return res_obj


@api.route('/pagecn')
class Dataset(Resource):
    '''Get static page content '''
    @api.doc('get_record')
    @api.expect(pagecn_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get static page content '''
        req_obj = request.json
        req_obj["coll"] = "c_html"
        res_obj = get_one(req_obj)
        return res_obj




@api.route('/init')
class Dataset(Resource):
    '''Get init '''
    @api.doc('get_record')
    @api.expect(init_query_model)
    def post(self):
        '''Get init '''
        req_obj = request.json
        req_obj["coll"] = "c_init"
        res_obj = get_one(req_obj)

        return res_obj





@api.route('/submit')
class Dataset(Resource):
    '''Submit gsa '''
    @api.doc('get_gsa')
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





