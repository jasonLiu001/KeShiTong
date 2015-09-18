/**
 * 当前模块用途：API简单授权，非登陆用户无法调用底层API接口
 * */
var express = require('express');
var router = express.Router();
var jsonResponse = require('../models/result');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var configuration = require('../config');
var connection = mongoose.createConnection(configuration.businessDBConfig.host, configuration.businessDBConfig.db);
var Schema = mongoose.Schema;

//DB
var schema = new Schema(configuration.businessDBConfig.schemas.user);
var User = connection.model(configuration.businessDBConfig.collections.user, schema);

router.use(function (req, res, next) {
    var errMsg = 'Authentication failed. You should login system.';
    /**
     * 过滤某些不需要授权的API
     * */
    var routerSkipAuth = function (regExp) {
        var matchResult = req.originalUrl.match(regExp);
        if (matchResult) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 如下API不需要授权认证
     * */
    if (routerSkipAuth(/\/api\//ig)) {
        if (routerSkipAuth(/\/presetSystemTemplate/ig)) {//系统模板预置API
            next();
        } else if (routerSkipAuth(/\/register/ig)) {//用户注册API
            next();
        } else if (routerSkipAuth(/\/check/ig)) {//E-mail检查API
            next();
        } else if (routerSkipAuth(/\/login/ig)) {//登陆API
            next();
        } else if (routerSkipAuth(/\/logout/ig)) {//注销API
            next();
        } else if (routerSkipAuth(/\/getUserTemplate/ig)) {//获取用户模板API
            next();
        } else if (routerSkipAuth(/\/changeDataSource/ig)) {//用户切换数据源API
            next();
        } else {
            if (req.session.userId) {
                User.find({_id: ObjectId(req.session.userId)}).exec(function (err, items) {
                    if (err)res.status(500).json({message: err.message});

                    if (items.length > 0) {
                        next();
                    } else {
                        res.status(401).json({message: errMsg});
                    }
                });
            } else {
                res.status(401).json({message: errMsg});
            }
        }
    } else {
        next();
    }
});

module.exports = router;
