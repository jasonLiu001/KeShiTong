var path = require('path');
/**
 * Config file.
 * */
function configuration() {
}

/**
 * business DB config.
 *
 * */
configuration.prototype.businessDBConfig = {
    db: 'DataVisualization',
    host: 'localhost',
    collections: {
        user: 'User',// user schema
        environment: 'Environment', //environment pollution.
        systemTemplate: 'SystemTemplate', // System Template
        systemTemplateData: 'SystemTemplateData', // System template data, it will be used to store system template data.
        userTemplate: 'UserTemplate', // User template
        userTemplateData: 'UserTemplateData' // User template data, it will be used to store user template data.
    },
    schemas: {
        user: {
            email: String,
            userName: String,
            password: String,
            sex: String,
            company: String,
            post: String,
            trade: String,
            telphone: String,
            userType: String,
            createDate: String
        },
        environment: {
            company: String,
            pollution_degree: Number,
            area: String,
            point: String,
            ph: Number,
            suspended_solid: Number,
            cod: Number,
            plumbum: Number,
            mercury: Number,
            inspect_time: Date
        },
        systemTemplate: {
            name: String, // Template name
            icon: String, // Template icon
            theme: String, // Template theme
            dataSourceIds: String, // Store the datasource ids from user upload datasource
            dataSourceNames: String, // All the datasource names, it will be used to show datasource in editor page
            dataSource: String, //
            template_config: String //系统模板配置 layout布局信息
        },
        systemTemplateData: {
            templateId: String,
            dataSource: String,
            dataSourceName: String
        }
        , userTemplate: {
            name: String, // Template name
            icon: String, // Template icon
            theme: String, // Template theme
            dataSourceIds: String, // Store the datasource ids from user upload datasource
            dataSourceNames: String, // All the datasource names, it will be used to show datasource in editor page
            dataSource: String, //
            template_status: String, // Template status, saved or published
            template_config: String, // The config of template, it store all the info from front page.
            userId: String, // The template owner
            updateTime: Date // The update time, it will be used to show the latest edit template.
        },
        userTemplateData: {
            templateId: String,
            dataSource: String,
            dataSourceName: String
        }
    }
};

/**
 * session db config.
 * */
configuration.prototype.sessionDBConfig = {
    db: 'SessionDB',
    host: 'localhost',
    collection: 'session'
};

/**
 * excel upload path.
 * */
configuration.prototype.uploadFilePath = {
    filePath: path.join(__dirname, 'uploads'),
    sheetNames: {
        waterMonitor: "水质监测点",
        waterCompany: "废水排放企业",
        airMonitor: "空气监测站点",
        airCompany: "废气排放企业"
    }
};

/**
 * 系统预置数据
 * */
configuration.prototype.presetData = {
    layoutFilePath: path.join(__dirname, 'public/js/data', 'Layouts.json'),
    layoutFilePath_prefix: __dirname,
    dataSourcePath: {//石家庄环保数据 预置数据源地址
        path: {
            datasource1: path.join(__dirname, 'public/js/data', 'data.json'),
            datasource2: path.join(__dirname, 'public/js/data', 'data_new.json'),
            datasource3: ""
        }
    }
};

/**
 * 环保数据源格式对象
 * */
configuration.prototype.environmentDataSource = function () {
    var dataSourceObj = {
        water: {},
        air: {}
    };
    return dataSourceObj;
};

/**
 * 模板状态
 * */
configuration.prototype.templateStatus = {
    unpublished: 'unpublished',
    published: 'published'
};

/**
 * HomePage的Json格式
 * */
configuration.prototype.homePageData = {
    latestEdit: [],
    templates: [],
    unpublished: [],
    published: []
};

module.exports = new configuration();