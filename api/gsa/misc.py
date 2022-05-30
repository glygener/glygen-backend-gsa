import os,sys
import json
import traceback
import csv
from flask import (Blueprint,request,jsonify,current_app)
from gsa.db import get_mongodb, log_error, next_sequence_value
from flask_restx import Resource, Api
from flask_mail import Mail, Message

from werkzeug.utils import secure_filename

bp = Blueprint('misc', __name__, url_prefix='/misc')

#api = Api(current_app)
api = Api(bp)


@bp.route('/hello', methods=('GET', 'POST'))
class HelloWorld(Resource):
    def hello(self):
        return "Hello!"



@bp.route('/hello_world', methods=('GET', 'POST'))
def hello_world():
    res_obj = {
        "message":"Hello World!",
        "instance_path":current_app.instance_path,
        "secret_key":current_app.config["SECRET_KEY"]
    }
    return jsonify(res_obj), 200


@bp.route('/upload', methods=('GET', 'POST'))
def upload():
    
    res_obj = {"config":{}}
    error_list = []
    if request.method != 'POST':
        error_list.append({"error":"only POST requests are accepted"})
    elif 'file' not in request.files:
        error_list.append({"error":"no file parameter given"})
    else:
        file = request.files['file']
        if file.filename == '':
            error_list.append({"error":"no filename given"})
        else:
            file_name = secure_filename(file.filename)
            out_file = os.path.join(current_app.config['DATA_PATH'], file_name)
            res_obj["out_file"] = out_file
            file.save(out_file)

    if error_list != []:
        return jsonify({"error_list":error_list}), 200

    return jsonify(res_obj), 200



@bp.route('/info', methods=('GET', 'POST'))
def info():
    res_obj = {"config":{}}
    #k_list = ["DB_HOST", "DB_NAME", "DB_USERNAME", "DB_PASSWORD",  "DATA_PATH"]
    #k_list = ["DB_HOST", "DB_NAME", "DB_USERNAME",  "DATA_PATH", "MAX_CONTENT_LENGTH"]
    k_list = ["SERVER","MAIL_SERVER", "MAIL_PORT", "MAIL_USE_TLS", "MAIL_USE_SSL", 
            "MAIL_USERNAME", "MAIL_PASSWORD"]    
    #k_list = ["DATA_PATH", "MAX_CONTENT_LENGTH"]
    for k in k_list:
        res_obj["config"][k] = current_app.config[k]
    mongo_dbh, error_obj = get_mongodb()
    res_obj["connection_status"] = "success" if error_obj == {} else error_obj
    return jsonify(res_obj), 200


@bp.route('/sendmail', methods=('GET', 'POST'))
def sendmail():


    #current_app.config["MAIL_SERVER"] = "localhost"
    
    res_obj = {}
    try:
        msg = Message(
            "Authentication code from GSA", 
            sender = current_app.config["MAIL_SENDER"], 
            recipients = ["rykahsay@gwu.edu"]
        )
        msg.body = "Your code is 112233"
        mail = Mail(current_app)
        mail.send(msg)
        res_obj = {"status":"success"}
    except Exception as e:
        res_obj =  log_error(traceback.format_exc())

    return jsonify(res_obj), 200
