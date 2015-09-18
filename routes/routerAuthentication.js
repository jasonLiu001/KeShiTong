/**
 * ��ǰģ����;��API����Ȩ���ǵ�½�û��޷����õײ�API�ӿ�
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
     * ����ĳЩ����Ҫ��Ȩ��API
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
     * ����API����Ҫ��Ȩ��֤
     * */
    if (routerSkipAuth(/\/api\//ig)) {
        if (routerSkipAuth(/\/presetSystemTemplate/ig)) {//ϵͳģ��Ԥ��API
            next();
        } else if (routerSkipAuth(/\/register/ig)) {//�û�ע��API
            next();
        } else if (routerSkipAuth(/\/check/ig)) {//E-mail���API
            next();
        } else if (routerSkipAuth(/\/login/ig)) {//��½API
            next();
        } else if (routerSkipAuth(/\/logout/ig)) {//ע��API
            next();
        } else if (routerSkipAuth(/\/getUserTemplate/ig)) {//��ȡ�û�ģ��API
            next();
        } else if (routerSkipAuth(/\/changeDataSource/ig)) {//�û��л�����ԴAPI
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
