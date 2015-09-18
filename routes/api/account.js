var express = require('express');
var router = express.Router();
var moment = require('moment');
var crypto = require('crypto');
var mongoose = require('mongoose');
var jsonResponse = require('../../models/result');
var configuration = require('../../config');
var connection=mongoose.createConnection(configuration.businessDBConfig.host, configuration.businessDBConfig.db);
var Schema = mongoose.Schema;

//DB
var schema = new Schema(configuration.businessDBConfig.schemas.user);
var User = connection.model(configuration.businessDBConfig.collections.user, schema);

//register a user
router.post('/register', function (req, res, next) {
    var email = req.body.emailID;
    var userName = req.body.userName;
    var password = req.body.password;
    var sex = req.body.sex;
    var company = req.body.company;
    var post = req.body.post;
    var trade = req.body.trade;
    var telphone = req.body.telphone;

    if (email == null || email == "") {
        res.json({message: 'email id cannot be empty.'});
    }

    User.find({email: email}).exec(function (err, users) {
        if (users.length > 0) {
            res.json({message: 'email id already existed.'})
        }
        else {
            var md5Obj = crypto.createHash('md5');
            var md5Password = md5Obj.update(password).digest("hex");

            var newUser = new User({
                email: email,
                userName: userName,
                sex: sex,
                company: company,
                post: post,
                trade: trade,
                password: md5Password,
                telphone: telphone,
                userType: "Free",
                createDate: moment().format('YYYY-M-D H:mm')
            });

            newUser.save(function (err) {
                if (err) return handleError(err);

                var rs = jsonResponse.success();
                res.json(rs);

                // saved!
            })
        }
    })
});

//check if a email id has been registered in system
router.post('/check', function (req, res, next) {

    var email = req.body.emailID;

    if (email == null || email == "") {
        var rs = jsonResponse.error('email id cannot be empty.');
        res.json(rs);
    }

    User.find({email: email}).exec(function (err, users) {
        if (users.length > 0) {
            var rs = jsonResponse.error('email id already existed.');
            res.json(rs);
        }
        else {
            var rs = jsonResponse.error('email id can be used.');
            res.json(rs);
        }
    })
});

//login & create session
router.post('/login', function (req, res, next) {
    var username = req.body.emailID;
    var password = req.body.passwordStr;
    var md5Obj = crypto.createHash('md5');
    var md5Password = md5Obj.update(password).digest("hex");

    User.find({email: username}).exec(function (err, users) {

        if (users.length > 0) {
            // validate username and password
            if (username == users[0].email && md5Password == users[0].password) {
                //create session
                req.session.name = users[0].email;
                req.session.userId=users[0]._id;

                //users[0].password = '';
                var user = users[0];

                //email: email,
                //            userName : userName,
                //            sex : sex,
                //            company : company,
                //            post : post,
                //            trade : trade,
                //            password: md5Password,
                //            telphone : telphone,
                //            userType: "Free",
                //            createDate: moment().format('YYYY-M-D H:mm')

                var t = {
                    id: user._id,
                    email: user.email,
                    name: user.userName,
                    sex: user.sex,
                    company: user.company,
                    post: user.post,
                    trade: user.trade,
                    telphone: user.telpnone,
                    userType: user.userType,
                    createDate: user.createDate,
                    permissions: ['Login']
                };

                //var t = JSON.parse(user.toString());
                //t.permissions = ['Login'];
                var rs = jsonResponse.success(t);
                res.json(rs);
            }
            else {
                var rs = jsonResponse.error('Password is not correct.');
                res.json(rs);
            }
        }
        else {
            var rs = jsonResponse.error('User does not exist.');
            res.json(rs);
        }
    });
});

//logout delete session
router.post('/logout', function (req, res, next) {
    req.session.destroy(function () {
        var rs = jsonResponse.success('log out');
        res.json(rs);
        //res.json({ message: 'log out' });
    })
});

module.exports = router;