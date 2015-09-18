var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async');
var fs = require('fs');
var path = require('path');
var jsonResponse = require('../../models/result');
var configuration = require('../../config');
var excelUploader = require('../../libs/dataServices/uploadExcel');
var dataHelper = require('../../libs/dataServices/dataHelper');
var connection = mongoose.createConnection(configuration.businessDBConfig.host, configuration.businessDBConfig.db);
var Schema = mongoose.Schema;

/**
 * environment pollution schema.
 * */
var environmentSchema = new Schema(configuration.businessDBConfig.schemas.environment);
var environmentPollute = connection.model(configuration.businessDBConfig.collections.environment, environmentSchema);

/**
 * 定义系统模板Schema
 * */
var systemTemplateSchema = new Schema(configuration.businessDBConfig.schemas.systemTemplate);
var systemTemplate = connection.model(configuration.businessDBConfig.collections.systemTemplate, systemTemplateSchema);

/**
 * 定义系统模板数据源Schema
 * */
var systemTemplateDataSchema = new Schema(configuration.businessDBConfig.schemas.systemTemplateData);
var systemTemplateData = connection.model(configuration.businessDBConfig.collections.systemTemplateData, systemTemplateDataSchema);

/**
 * 定义用户模板Schema
 * */
var userTemplateSchema = new Schema(configuration.businessDBConfig.schemas.userTemplate);
var userTemplate = connection.model(configuration.businessDBConfig.collections.userTemplate, userTemplateSchema);

/**
 * 定义用户模板数据源Schema
 * */
var userTemplateDataSchema = new Schema(configuration.businessDBConfig.schemas.userTemplateData);
var userTemplateData = connection.model(configuration.businessDBConfig.collections.userTemplateData, userTemplateDataSchema);

/**
 * API 功能：用户上传Excel文件 并挂载到当前模板下
 */
router.post('/upload', excelUploader.init().single('excel'), function (req, res, next) {
    var user_templateId = req.query.user_templateId;//用户模板ID
    var dataSourceName = req.query.dataSourceName;//用户数源名称
    async.waterfall([
            function (cb) {
                excelUploader.excel2Json(function (err, excelJson) {
                    cb(err, excelJson);
                });
            },
            function (excelData, cb) {//保存Excel到DB
                var dataSourceObj = configuration.environmentDataSource();

                /**
                 * 根据Excel名称设置数据源数据
                 * @param {Object} excelSheet Excel中单个sheet对象
                 * @param {Function} innerCallback 设置数据源对象的回调函数
                 * */
                var setDataSourceObj = function (excelSheet, innerCallback) {
                    if (excelSheet.sheetName == configuration.uploadFilePath.sheetNames.waterMonitor) {
                        dataSourceObj.water.监测点 = excelSheet.data;
                    } else if (excelSheet.sheetName == configuration.uploadFilePath.sheetNames.waterCompany) {
                        dataSourceObj.water.污染企业 = excelSheet.data;
                    } else if (excelSheet.sheetName == configuration.uploadFilePath.sheetNames.airMonitor) {
                        dataSourceObj.air.监测点 = excelSheet.data;
                    } else if (excelSheet.sheetName == configuration.uploadFilePath.sheetNames.airCompany) {
                        dataSourceObj.air.污染企业 = excelSheet.data;
                    } else {
                        innerCallback(new Error('Uploaded excel template format error!'), null);
                    }
                };

                //水和空气
                if (excelData.length > 0) {////这里用中文key（监测点、污染企业）的原因：前端获取到Json后无需再做名称映射，直接展示在界面
                    setDataSourceObj(excelData[0], cb);
                    if (excelData.length > 1) {//空气数据源
                        setDataSourceObj(excelData[1], cb);
                    }
                    if (excelData.length > 2) {
                        setDataSourceObj(excelData[2], cb);
                    }
                    if (excelData.length > 3) {
                        setDataSourceObj(excelData[3], cb);
                    }
                } else {
                    cb(new Error('Upload excel data verify error! Excel must have one sheet at least.'), null);
                }

                var userTemplate_data = userTemplateData({
                    templateId: user_templateId,
                    dataSource: JSON.stringify(dataSourceObj),
                    dataSourceName: dataSourceName
                });

                userTemplate_data.save(function (err, model) {
                    cb(err, model);
                });
            },
            function (newDataSource, cb) {//获取之前旧的数据源列表信息
                userTemplate.find({_id: ObjectId(user_templateId)}).lean().exec(function (err, items) {
                    cb(err, items, newDataSource);
                });
            },
            function (userTemplateModels, newDataSource, cb) {//更新用户模板
                if (userTemplateModels.length > 0) {
                    var userTemplateModel = userTemplateModels[0];
                    var temp_dataSourceIds = JSON.parse(userTemplateModel.dataSourceIds);
                    var temp_dataSourceNames = JSON.parse(userTemplateModel.dataSourceNames);
                    temp_dataSourceIds.push(newDataSource.id);
                    temp_dataSourceNames.push(dataSourceName);

                    var updatedProperties = {
                        dataSourceIds: JSON.stringify(temp_dataSourceIds),
                        dataSourceNames: JSON.stringify(temp_dataSourceNames)
                    };

                    userTemplate.findOneAndUpdate({_id: ObjectId(user_templateId)}, updatedProperties, function (err, model) {
                        //向前端返回新数据源对象
                        var responseData = {dataSourceId: newDataSource.id, dataSourceName: dataSourceName};
                        cb(err, responseData);
                    });
                } else {
                    cb(new Error('can not find user template by id(' + user_templateId + ')'), null);
                }
            }
        ],
        function (err, result) {
            var rs = null;
            if (err) {
                rs = jsonResponse.error(err.message);
            } else {
                rs = jsonResponse.success(result);
            }
            res.json(rs);
        }
    )
    ;
});

/**
 * API 功能：用户点击数据源名称时，进行数据源切换
 * */
router.post('/changeDataSource', function (req, res, next) {
    var dataSourceId = req.body.dataSourceId;//用户当前选择的数据源ID
    userTemplateData.find({_id: dataSourceId}).lean().exec(function (err, items) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            var dataSourceJson = dataHelper.getJsonStringFromMongoDB(items);
            rs = jsonResponse.success(dataSourceJson);
        }
        res.json(rs);
    });
});

/**
 * API功能：数据管理员动态 预置系统模板，如：石家庄环保数据
 * 需要传递参数列表如下：
 * {
  "name":"系统模板",    //系统模板默认名称
  "icon_path":"../../images/thumbnail01.png",   //系统模板对应默认界面图标相对路径
  "theme":"theme1",     //系统模板对应默认主题名称
   template_config_path:"",     //系统模板默认Layout配置相对路径
   "dataSource_paths":["public/js/data/data.json","public/js/data/data.json"],  //系统模板中所有的数据源对应的相对路径
   "dataSource_names":["系统数据源01","系统数据源02"]     //系统模板中所有的数据源对应的名称
}
 */
router.post('/presetSystemTemplate', function (req, res, next) {
    var name = req.body.name;
    var icon_path = req.body.icon_path;
    var theme = req.body.theme;
    var template_config_path = req.body.template_config_path;
    var dataSource_paths = req.body.dataSource_paths;
    var dataSource_names = req.body.dataSource_names;

    //系统模板默认数据源
    var defaultDataSource = null;
    //系统模板中存储的数据源ID数组
    var dataSourceIdArray = [];
    //系统模板中存储的数据源名称
    var dataSourceNameArray = [];

    async.waterfall([
        function (cb) {//读取传递的模板Layout文件路径
            fs.readFile(path.join(configuration.presetData.layoutFilePath_prefix, template_config_path), {encoding: 'utf8'}, function (err, layoutData) {
                cb(err, layoutData);
            });
        },
        function (layoutData, cb) {//生成系统模板
            //preset a system template object.
            var sysTemplate = new systemTemplate({
                name: name,
                icon: icon_path,
                theme: theme,
                dataSourceIds: '',
                dataSourceNames: '',
                dataSource: '',
                template_config: layoutData
            });

            systemTemplate.findOneAndUpdate({name: sysTemplate.name}, {template_config: layoutData}, function (err, templateData) {
                if (err)cb(err, null);

                if (templateData == null) {
                    sysTemplate.save(function (err, newObject) {
                        cb(err, newObject);
                    });
                } else {
                    cb(err, templateData);
                }
            });
        },
        function (sysTemplateModel, cb) {//保存系统模板数据源
            var createSysTemplateData = function (i) {
                if (i < dataSource_paths.length) {//读取多个数据源文件
                    async.waterfall([
                        function (innerCallback) {// Step 1: 读取预置的数据源文件
                            fs.readFile(path.join(configuration.presetData.layoutFilePath_prefix, dataSource_paths[i]), {encoding: 'utf8'}, function (err, dataSourceString) {
                                innerCallback(err, dataSourceString);
                            });
                        },
                        function (dataSourceString, innerCallback) {//Step 2: 设置数据源列表中最后一个为默认数据源
                            //设置系统模板的默认数据源
                            defaultDataSource = dataSourceString;

                            var sysTemplateData = new systemTemplateData({
                                templateId: sysTemplateModel.id,
                                dataSource: dataSourceString,
                                dataSourceName: dataSource_names[i]
                            });

                            systemTemplateData.findOneAndUpdate({templateId: sysTemplateModel.id, dataSourceName: dataSource_names[i]}, {dataSource: dataSourceString}, function (err, resultData) {
                                innerCallback(err, sysTemplateData, resultData);
                            });
                        },
                        function (arg1, arg2, innerCallback) {//Step 3: 保存系统模板数据源到mongodb
                            //预置数据源名称
                            dataSourceNameArray.push(dataSource_names[i]);
                            if (arg2 == null) {
                                //保存系统模板数据源
                                arg1.save(function (err, newObject) {
                                    //保存数据源ID
                                    dataSourceIdArray.push(newObject.id);
                                    innerCallback(err, newObject.templateId);//传递模板ID
                                });
                            } else {
                                dataSourceIdArray.push(arg2.id);
                                innerCallback(null, arg2.templateId);
                            }
                        },
                        function (sys_template_id, innerCallback) {//Step 4: 保存系统模板数据源之后，回头更新系统模板中对应的数据源列表字段

                            var updatedData = {
                                dataSourceIds: JSON.stringify(dataSourceIdArray),
                                dataSourceNames: JSON.stringify(dataSourceNameArray),
                                dataSource: defaultDataSource//更新系统默认数据源
                            };

                            //mongoose findOneAndUpdate method callback function return object before update.
                            systemTemplate.findOneAndUpdate({_id: ObjectId(sys_template_id)}, updatedData, function (err, lastSysTemplateModel) {
                                innerCallback(err, lastSysTemplateModel);
                            });
                        },
                        function (lastSysTemplateModel, innerCallback) {//Step 5: 取最新的系统模板数据，并返回给前端
                            systemTemplate.find({_id: ObjectId(lastSysTemplateModel.id)}).exec(function (err, items) {
                                if (err)innerCallback(err, null);

                                if (items.length > 0) {
                                    innerCallback(err, items[0]);
                                } else {
                                    innerCallback(new Error('can not find object from system template collection by id(' + lastSysTemplateModel.id + ')'), null);
                                }
                            });
                        }
                    ], function (err, innerResult) {
                        if (err) {
                            cb(err, null);
                        } else {
                            if (i == dataSource_paths.length - 1) {
                                cb(err, innerResult);
                            } else {
                                createSysTemplateData(i + 1);
                            }
                        }
                    });
                }
            };
            createSysTemplateData(0);
        }
    ], function (err, result) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(result);
        }
        res.json(rs);
    });
});

/**
 * API功能：预置系统模板，如：石家庄环保数据 无需传递参数，所有预置工作后台完成
 * */
router.get('/presetSystemTemplate', function (req, res, next) {
    //系统模板默认数据源
    var defaultDataSource = null;
    //系统模板中存储的数据源ID数组
    var dataSourceIdArray = [];
    //系统模板中存储的数据源名称
    var dataSourceNameArray = [];

    async.waterfall([
        function (cb) {//获取预置的“石家庄系统模板数据”
            fs.readFile(configuration.presetData.layoutFilePath, {encoding: 'utf8'}, function (err, layoutData) {
                cb(err, layoutData);
            });
        },
        function (layoutData, cb) {//预置“石家庄环保数据”系统模板
            //preset a system template object.
            var sysTemplate = new systemTemplate({
                name: '环保大数据可视化',
                icon: '../../images/thumbnail01.png',
                theme: 'theme1',
                dataSourceIds: '',
                dataSourceNames: '',
                dataSource: '',
                template_config: layoutData
            });

            systemTemplate.findOneAndUpdate({name: sysTemplate.name}, {template_config: layoutData}, function (err, templateData) {
                if (err)cb(err, null);

                if (templateData == null) {
                    //保存系统模板数据并返回objectID
                    sysTemplate.save(function (err, newObject) {
                        cb(err, newObject.id);
                    });
                } else {
                    cb(err, templateData.id);//更新系统模板数据并返回objectID
                }
            });
        },
        function (templateId, cb) {//预置“石家庄环保数据”系统通模板 Excel数据源 第一个默认的数据源
            async.waterfall([
                function (innerCallback) {
                    fs.readFile(configuration.presetData.dataSourcePath.path.datasource1, {encoding: 'utf8'}, function (err, dataSourceJSONString) {
                        innerCallback(err, dataSourceJSONString);
                    });
                },
                function (dataSourceJSONString, innerCallback) {
                    //设置系统模板的默认数据源
                    defaultDataSource = dataSourceJSONString;
                    //预置数据源的默认名称
                    var firstDataSourceName = '示例数据';

                    var sysTemplateData = new systemTemplateData({
                        templateId: templateId,
                        dataSource: dataSourceJSONString,
                        dataSourceName: firstDataSourceName
                    });

                    systemTemplateData.findOneAndUpdate({templateId: templateId, dataSourceName: firstDataSourceName}, {dataSource: dataSourceJSONString}, function (err, resultData) {
                        if (err)innerCallback(err, null);

                        //预置数据源名称
                        dataSourceNameArray.push(firstDataSourceName);
                        if (resultData == null) {
                            //保存系统模板数据源
                            sysTemplateData.save(function (err, newObject) {
                                //保存数据源ID
                                dataSourceIdArray.push(newObject.id);
                                innerCallback(err, templateId);
                            });
                        } else {
                            dataSourceIdArray.push(resultData.id);
                            innerCallback(err, templateId);
                        }
                    });

                }
            ], function (err, result) {
                cb(err, result);
            });
        },
        function (templateId, cb) {//更新模板数据中的id标识和名称
            var updatedData = {
                dataSourceIds: JSON.stringify(dataSourceIdArray),
                dataSourceNames: JSON.stringify(dataSourceNameArray),
                dataSource: defaultDataSource//更新系统默认数据源
            };
            //mongoose findOneAndUpdate method callback function return object before update.
            systemTemplate.findOneAndUpdate({_id: ObjectId(templateId)}, updatedData, function (err, oldTemplateData) {
                cb(err, oldTemplateData);
            });
        },
        function (oldTemplateData, cb) {//解决mongoose的bug,调用findOneAndUpdate时，总是回传上一个Model对象
            systemTemplate.find({_id: ObjectId(oldTemplateData.id)}).exec(function (err, items) {
                if (err)cb(err, null);

                if (items.length > 0) {
                    cb(err, items[0]);
                } else {
                    cb(new Error('can not find object from system template collection by id(' + oldTemplateData.id + ')'), null);
                }
            });
        }
    ], function (err, result) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(result);
        }
        res.json(rs);
    });
});

/**
 * API 功能 当用户点击具体的模板Panel时，如：'石家庄环保数据'，立即创建用户模板
 * 没有和保存用户模板API合并的原因：当用户进入编辑器页面是，可能还会进行上传Excel的操作等，系统模板中不会记录用户的操作的一些行为
 * */
router.post('/createUserTemplate', function (req, res, next) {
    var system_templateId = req.body.system_templateId;//需要页面传递一个当前使用的系统模板ID
    async.waterfall([
        function (cb) {
            systemTemplate.find({_id: ObjectId(system_templateId)}, function (err, item) {
                if (err)cb(err, null);

                if (item.length > 0) {
                    cb(err, item[0]);
                } else {
                    cb(new Error('can not find data from system template collection by id(' + system_templateId + ')'), null);
                }
            });
        },
        function (systemTemplateModel, cb) {//复制系统模板数据到用户模板
            var currentUserTemplate = new userTemplate({
                name: 'untitled',
                icon: systemTemplateModel.icon,
                theme: systemTemplateModel.theme,
                dataSourceIds: systemTemplateModel.dataSourceIds,
                dataSourceNames: systemTemplateModel.dataSourceNames,
                dataSource: systemTemplateModel.dataSource,
                template_status: configuration.templateStatus.unpublished,
                template_config: systemTemplateModel.template_config,
                userId: req.session.userId,
                updateTime: new Date()
            });

            currentUserTemplate.save(function (err, newUserTemplate) {
                cb(err, newUserTemplate, systemTemplateModel);
            });
        },
        function (newUserTemplateModel, systemTemplateModel, cb) {//创建用户模板并生成用户数据源
            //Step 1: 获取系统模板对应的所有数据源ID
            var dataSourcesIds = JSON.parse(systemTemplateModel.dataSourceIds);

            if (dataSourcesIds.length > 0) {
                var copySysDataSource = function (i) {
                    if (i < dataSourcesIds.length) {
                        async.waterfall([
                            function (innerCallback) { //Step 2: 根据系统数据源ID查询实体，并复制到用户模板的数据源列表中
                                systemTemplateData.find({_id: dataSourcesIds[i]}).exec(function (err, modelItems) {
                                    innerCallback(err, modelItems);
                                });
                            },
                            function (modelItems, innerCallback) {  //Step 3: 创建新的用户数据源
                                if (modelItems.length > 0) {
                                    var currentUserTemplateData = new userTemplateData({
                                        templateId: newUserTemplateModel.id,
                                        dataSource: modelItems[0].dataSource,
                                        dataSourceName: modelItems[0].dataSourceName
                                    });

                                    currentUserTemplateData.save(function (err, newUserTemplateDataModel) {
                                        innerCallback(err, newUserTemplateDataModel);
                                    });
                                } else {
                                    innerCallback(new Error('can not find data from systemTemplateData collection by id(' + dataSourcesIds[i] + ')'), null);
                                }
                            },
                            function (newUserTemplateDataModel, innerCallback) { //Step 4: 更新用户模板中对应的数据源字段
                                var tempDataSourceIds = [];
                                tempDataSourceIds.push(newUserTemplateDataModel.id);//保存新的用户数据源ID

                                userTemplate.findOneAndUpdate({_id: newUserTemplateModel.id}, {dataSourceIds: JSON.stringify(tempDataSourceIds)}, function (err, updateModel) {
                                    innerCallback(err, updateModel);
                                });
                            },
                            function (oldUserTemplateModel, innerCallback) {//解决mongoose的FindOneAndUpdate方法返回值的bug，重新取最新的model对象，返回给前端对象
                                userTemplate.find({_id: oldUserTemplateModel.id}).exec(function (err, items) {
                                    if (err)innerCallback(err, null);

                                    if (items.length > 0) {
                                        innerCallback(err, items[0]);
                                    } else {
                                        innerCallback(new Error('Can not find model from user template collection by id(' + oldUserTemplateModel.id + ')'), null);
                                    }
                                });
                            }
                        ], function (err, innerResult) {
                            if (err) {
                                cb(err, null);
                            } else {
                                if (i == dataSourcesIds.length - 1) {
                                    cb(err, innerResult);
                                } else {
                                    copySysDataSource(i + 1);
                                }
                            }
                        });
                    }
                };
                copySysDataSource(0);
            } else {
                cb(new Error('system template must be have a default dataSource!'), null);
            }
        }
    ], function (err, result) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(result);
        }
        res.json(rs);
    });
});

/**
 * API 功能保存用户模板
 * */
router.post('/saveUserTemplate', function (req, res, next) {
    var name = req.body.name;
    var template_config = req.body.template_config;//用户模板的layout设置
    //dataSourceIds 在用户上传Excel数据时，更新该值
    //dataSourceNames 在用户上传Excel数据时，更新该值
    //dataSource 在用户点击左边具体的数据源名称时，更新该值
    var user_templateId = req.body.user_templateId;//用户模板ID

    var updatedProperties = {
        name: name,
        template_config: template_config
        //template_status: configuration.templateStatus.unpublished//注：用户模板只有发布和未发布状态，保存时用户模板状态不变
    };
    async.waterfall([
        function (cb) {
            //更新并保存用户模板
            userTemplate.findOneAndUpdate({_id: ObjectId(user_templateId)}, updatedProperties, function (err, result) {
                cb(err, result);
            });
        },
        function (args, cb) {//解决mongoose的FindOneAndUpdate方法bug，总是返回更新前的model对象
            userTemplate.find({_id: ObjectId(user_templateId)}).exec(function (err, items) {
                if (err)cb(err, null);

                if (items.length > 0) {
                    cb(err, items[0]);
                } else {
                    cb(new Error('can not find model from user template collection by id(' + user_templateId + ')'), null);
                }
            });
        }
    ], function (err, finalResult) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(finalResult);
        }
        res.json(rs);
    });
});

/**
 * API 功能 更新用户模板状态 发布=published  保存=unpublished
 * */
router.post('/updateUserTemplateStatus', function (req, res, next) {
    var user_templateId = req.body.user_templateId;//用户模板ID
    var template_status = req.body.template_status;//用户模板状态

    if (template_status != configuration.templateStatus.published && template_status != configuration.templateStatus.unpublished) {
        return res.json(jsonResponse.error('Template status vale must be published or unpublished'));
    }

    async.waterfall([
        function (cb) {//更新用户模板状态为保存状态
            userTemplate.findOneAndUpdate({_id: ObjectId(user_templateId)}, {
                template_status: template_status,
                updateTime: new Date()
            }, function (err, result) {
                cb(err, result);
            });
        },
        function (args, cb) {//返回新的用户模板数据
            userTemplate.find({_id: ObjectId(user_templateId)}).exec(function (err, items) {
                if (err)cb(err, null);

                if (items.length > 0) {
                    cb(err, items[0]);
                } else {
                    cb(new Error('can not find model from user template collection by id(' + user_templateId + ')'), null);
                }
            });
        }
    ], function (err, finalResult) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(finalResult);
        }
        res.json(rs);
    });
});

/**
 * API 功能 获取用户模板
 * */
router.post('/getUserTemplate', function (req, res, next) {
    var user_templateId = req.body.user_templateId;//用户模板ID
    userTemplate.find({_id: user_templateId}).lean().exec(function (err, items) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            var userTemplateJson = dataHelper.getJsonStringFromMongoDB(items);
            rs = jsonResponse.success(userTemplateJson);
        }
        res.json(rs);
    });
});

/**
 * API 功能 获取HomePage页面Json
 * */
router.post('/getHomePage', function (req, res, next) {
    var userId = req.session.userId;
    var homePageJson = configuration.homePageData;
    async.series([
        function (cb) {//获取最新编辑的
            userTemplate.find({
                template_status: configuration.templateStatus.unpublished,
                userId: userId
            }).sort({_id: -1}).limit(5).exec(function (err, models) {
                homePageJson.latestEdit = dataHelper.convertUserTemplate2HomePageData(models);
                cb(err, models);
            });
        },
        function (cb) {//获取所有系统模板
            systemTemplate.find({}).sort({_id: -1}).exec(function (err, models) {
                homePageJson.templates = dataHelper.convertUserTemplate2HomePageData(models);
                cb(err, models);
            });
        },
        function (cb) {//获取所有未发布的
            userTemplate.find({
                template_status: configuration.templateStatus.unpublished,
                userId: userId
            }).sort({_id: -1}).exec(function (err, models) {
                homePageJson.unpublished = dataHelper.convertUserTemplate2HomePageData(models);
                cb(err, models);
            });
        },
        function (cb) {//获取所有已经发布的模板
            userTemplate.find({
                template_status: configuration.templateStatus.published,
                userId: userId
            }).sort({_id: -1}).exec(function (err, models) {
                homePageJson.published = dataHelper.convertUserTemplate2HomePageData(models);
                cb(err, models);
            });
        }
    ], function (err, results) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            rs = jsonResponse.success(homePageJson);
        }
        res.json(rs);
    });
});

/**
 *  API功能：点击特定的预制模板的名称时，进入到编辑器界面时需要调用的Layout数据信息
 * */
router.post('/getSystemTemplate', function (req, res, next) {
    var system_tempalteId = req.body.system_tempalteId;
    systemTemplate.find({_id: system_tempalteId}).lean().exec(function (err, items) {
        var rs = null;
        if (err) {
            rs = jsonResponse.error(err.message);
        } else {
            var systemTemplateJson = dataHelper.getJsonStringFromMongoDB(items);
            rs = jsonResponse.success(systemTemplateJson);
        }
        res.json(rs);
    });
});

module.exports = router;
