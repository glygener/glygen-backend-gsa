import os
import bcrypt
import re
import json
import traceback
import functools
from bson import json_util
from pyotp import TOTP, random_base32
from flask_mail import Mail, Message



from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app
)
from flask_jwt_extended import (
    jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies, get_csrf_token,
    set_refresh_cookies, unset_jwt_cookies
)
from werkzeug.security import check_password_hash, generate_password_hash
from gsa.db import get_mongodb,  log_error
from gsa.document import get_one, get_many, insert_one
bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/login_one', methods=('GET', 'POST'))
def login_one():

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")

    try:
        username = request.json.get("email", None)
        password = request.json.get("password", None)
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        user_doc = mongo_dbh["c_user"].find_one({'email' : username })       
        error = None
        if user_doc is None:
            error = "Login failed: either your email or password is incorrect."
        else:
            submitted_password = password.encode('utf-8')
            #stored_password = user_doc['password'].encode('utf-8')
            stored_password = user_doc['password']
            
            if bcrypt.hashpw(submitted_password, stored_password) != stored_password:
                error = "Login failed: either your email or password is incorrect."
        res_obj = {"status":1}
        if error is None:
            res_obj = {'status': 1, "email": user_doc["email"], "phone":user_doc["phone"]}
        else:
            res_obj = jsonify({"status":0, "error":error})
    except Exception as e:
        res_obj =  jsonify(log_error(traceback.format_exc()))
        

    return res_obj, 200


@bp.route('/login_two', methods=('GET', 'POST'))
def login_two():

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")

    try:
        username = request.json.get("email", None)
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        user_doc = mongo_dbh["c_user"].find_one({'email' : username })
        error = None
        if user_doc is None:
            error = "Login failed: either your email or password is incorrect."

        res_obj = {"status":1}
        if error is None:
            shared_key = random_base32()
            totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
            code = totp.now()
            res_obj = {'status': 1, "email": user_doc["email"], "phone":user_doc["phone"], "shared_key":shared_key}
            message = "<#>GSA: DO NOT share this Sign In code. We will never call you or text you for it. "
            message += "Code %s" % (code)
            mail_obj = {
                "sender_email":current_app.config["MAIL_SENDER"],
                "receiver_email":user_doc["email"],
                "subject":"Authentication code from GSA",
                "body":message
            }
            send_mail(mail_obj)
        else:
            res_obj = jsonify({"status":0, "error":error})
    except Exception as e:
        res_obj =  jsonify(log_error(traceback.format_exc()))


    return res_obj, 200



@bp.route('/login_three', methods=('GET', 'POST'))
def login_three():

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")
    try:
        username = request.json.get("email", None)
        code = request.json.get("code", None)
        shared_key = request.json.get("shared_key", None)
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        user_doc = mongo_dbh["c_user"].find_one({'email' : username })
        error = None
        if user_doc is None:
            error = "Login failed: either your email or password is incorrect."
        res_obj = {"status":1}
        if error is None:
            totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
            valid = totp.verify(code)
            if valid:
                res_obj = {"status":1}
                access_token = create_access_token(identity=username)
                refresh_token = create_refresh_token(identity=username)
                res_obj["access_csrf"] = get_csrf_token(access_token)
                res_obj["refresh_csrf"] = get_csrf_token(refresh_token)
                res_obj["username"] = user_doc["email"]
                res_obj["fullname"] = user_doc["fname"] + " " + user_doc["lname"]
                res_obj = jsonify(res_obj)
                session['email'] = user_doc["email"]
                set_access_cookies(res_obj, access_token)
                set_refresh_cookies(res_obj, refresh_token)
            else:
                res_obj = jsonify({"status":0, "error": "invalid code"})
        else:
            res_obj = jsonify({"status":0, "error":error})
    except Exception as e:
        res_obj =  jsonify(log_error(traceback.format_exc()))


    return res_obj, 200



@bp.route('/login_direct', methods=('GET', 'POST'))
def login_direct():

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")

    try:
        username = request.json.get("email", None)
        password = request.json.get("password", None)
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        user_doc = mongo_dbh["c_user"].find_one({'email' : username })
        error = None
        if user_doc is None:
            error = "Login failed: either your email or password is incorrect."
        else:
            submitted_password = password.encode('utf-8')
            #stored_password = user_doc['password'].encode('utf-8')
            stored_password = user_doc['password']

            if bcrypt.hashpw(submitted_password, stored_password) != stored_password:
                error = "Login failed: either your email or password is incorrect."
        res_obj = {"status":1}
        if error is None:
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)
            res_obj["access_csrf"] = get_csrf_token(access_token)
            res_obj["refresh_csrf"] = get_csrf_token(refresh_token)
            res_obj["username"] = user_doc["email"]
            res_obj["fullname"] = user_doc["fname"] + " " + user_doc["lname"]
            res_obj = jsonify(res_obj)
            session['email'] = user_doc["email"]
            set_access_cookies(res_obj, access_token)
            set_refresh_cookies(res_obj, refresh_token)
        else:
            res_obj = jsonify({"status":0, "error":error})
    except Exception as e:
        res_obj =  jsonify(log_error(traceback.format_exc()))


    return res_obj, 200





def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login_one'))

        return view(**kwargs)

    return wrapped_view

@bp.route('/refresh', methods=('GET', 'POST'))
@jwt_refresh_token_required
def refresh():
    # Create the new access token
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)

    # Set the access JWT and CSRF double submit protection cookies
    # in this response
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, access_token)
    return resp, 200


# Because the JWTs are stored in an httponly cookie now, we cannot
# log the user out by simply deleting the cookie in the frontend.
# We need the backend to send us a response to delete the cookies
# in order to logout. unset_jwt_cookies is a helper function to
# do just that.
@bp.route('/logout', methods=('GET', 'POST'))
def logout():
    res_obj = jsonify({"status": 1})
    unset_jwt_cookies(res_obj)
    return res_obj, 200



@bp.route('/register_one', methods=('GET', 'POST'))
def register_one():
    try:
        req_obj = request.json
        new_email, new_password = req_obj["record"]["email"], req_obj["record"]["password"]
        
        new_password = bcrypt.hashpw(new_password.encode('utf-8'),bcrypt.gensalt())
        error_obj = verify_password(req_obj["record"]["email"], req_obj["record"]["password"])
        if error_obj != {}:
            return jsonify(error_obj), 200


        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        if mongo_dbh["c_user"].find({"email":new_email}).count() != 0:
            return jsonify({"status":0, 
                "error":"The email submitted is already registered!"}), 200
        else:
            shared_key = random_base32()
            totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
            code = totp.now()
            if current_app.config["SERVER"] == "dev":
                shared_key, code = "xxx", "xxx"

            res_obj = {'status': 1, "email": new_email, "shared_key":shared_key,
                "fname":req_obj["record"]["fname"], "lname":req_obj["record"]["lname"]
            }
            body = "<#>GSA: DO NOT share this Sign In code. "
            body += "We will never call you or text  you for it. "
            body += "Code %s" % (code)
            mail_obj = {
                "sender_email":current_app.config["MAIL_SENDER"],
                "receiver_email":new_email,
                "subject":"Authentication code from GSA",
                "body":body
            }
            if current_app.config["SERVER"] == "dev":
                res_obj["mailobj"] = mail_obj
            else:
                send_mail(mail_obj)
    except Exception as e:
        res_obj =  log_error(traceback.format_exc())


    return res_obj, 200


@bp.route('/register_two', methods=('GET', 'POST'))
def register_two():

    res_obj = {}
    try:
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200
        req_obj = request.json
        pwd = req_obj["record"]["password"]
        req_obj["record"]["password"] = bcrypt.hashpw(pwd.encode('utf-8'),bcrypt.gensalt())
        code = req_obj["record"]["code"]
        shared_key = req_obj["record"]["shared_key"] 
        totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
        valid = True
        if current_app.config["SERVER"] != "dev":
            valid = totp.verify(code)
        if valid:
            if mongo_dbh["c_user"].find({"email":req_obj["record"]["email"]}).count() != 0:
                return jsonify({"status":0,
                    "error":"The email submitted is already registered!"}), 200
            else:
                req_obj["record"]["status"] = 1
                res_obj = insert_one(req_obj)
                message = "You have registered successfully! "
                message += "Please <a href=\"/login\">click here</a> to login."
                res_obj = {"status":1,  "messagecn":message}
        else:
            res_obj = jsonify({"status":0, "error": "invalid code"})

    except Exception as e:
        res_obj =  log_error(traceback.format_exc())


    return res_obj, 200


# Protect a route with jwt_required, which will kick out requests
# without a valid JWT present.
@bp.route("/userinfo", methods=["GET", "POST"])
@jwt_required
def userinfo():
    # Access the identity of the current user with get_jwt_identity
    email = get_jwt_identity()
    user_info, err_obj, status = get_userinfo(email)
    if status == 0:
        return jsonify(err_obj), 200

    return jsonify(user_info), 200




@bp.route('/generate_otp', methods=('GET', 'POST'))
def generate_otp():

    phone = request.json.get("phone", None)
    shared_key = random_base32()
    totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
    code = totp.now()
    res_obj = {'ok': True, 'code':code, 'message': 'Code sent to {phone}', 'shared_key': shared_key}
    mail_obj = {
        "sender_email":current_app.config["MAIL_SENDER"],
        "receiver_email":"rykahsay@gmail.com",
        "subject":"Test message",
        "body":"Hi there"
    }
    send_mail(mail_obj)

    return res_obj, 200


@bp.route('/validate_otp', methods=('GET', 'POST'))
def validate_otp():
 
    res_obj = {"status":0}
    #if session['email'] == None:
    #    res_obj = {"status":0, "error": "invalid session"}
    code = request.json.get("code", None)
    shared_key = request.json.get("shared_key", None)
    #shared_key = random_base32()
    totp = TOTP(shared_key, interval=current_app.config["TOTP_INTERVAL"])
    valid = totp.verify(code)
    if valid:
        res_obj = {"status":1}
    else:
        res_obj = {"status":0, "error": "invalid code"}

    return res_obj, 200



def send_mail(mail_obj):

    mail = Mail(current_app)
    msg = Message(mail_obj["subject"], sender = mail_obj["sender_email"], recipients = [mail_obj["receiver_email"]])
    msg.body = mail_obj["body"]
    mail.send(msg)
  
    return "Message sent!"






def get_userinfo(user_name):

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")
    config_obj = json.load(open(json_url))

    try:
        mongo_dbh, error_obj = get_mongodb()
        user_doc = mongo_dbh["c_user"].find_one({'email' : user_name })
        user_info = {
            "fname":user_doc["fname"],
            "lname":user_doc["lname"],
            "email":user_doc["email"],
            "status":user_doc["status"]
        }
        return user_info, {}, 1
    except Exception as e:
        err_obj =  log_error(traceback.format_exc())
        return {}, err_obj, 0



def verify_password(email, password):

    error_obj = {}
    if email.find("@") == -1 or email.find(".") == -1 :
        error_obj = {"status":0, "error": "invalid email"}
    reg = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
    mat = re.match(reg, password)
    if mat == None:
        error_obj = {"status":0, "error": "weak password"}

    return error_obj






