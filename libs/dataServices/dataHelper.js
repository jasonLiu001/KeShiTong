/**
 * 数据服务帮助类
 * */
function dataHelper() {
}

/**
 * convert mongodb documents to jsonObject.
 *
 * @params {Object} items pure javascript object.
 * @return {String} return json string
 * */
dataHelper.getJsonStringFromMongoDB = function (items) {
    if (items) {
        if (items.length > 0) {
            var ele = items[0];
            delete ele.__v;
            return ele;
        } else {
            return null;
        }
    }
    return null;
};

/**
 * convert mongodb documents to json array.
 *
 * @params {Object} items pure javascript object.
 * @return {Array} return json string
 * */
dataHelper.getJsonArrayFromMongoDB = function (items) {
    var result = [];
    for (var i = 0; i < items.length; i++) {
        var ele = items[i];
        delete ele.__v;
        result.push(ele);
    }
    return result;
};

dataHelper.convertUserTemplate2HomePageData = function (items) {
    var result = [];
    var homePageData = function (title, id, icon) {
        this.title = title;
        this.id = id;
        this.icon = icon;
    };

    for (var i = 0; i < items.length; i++) {
        var e = items[i];
        var homePageObj = new homePageData(e.name, e.id, e.icon);
        result.push(homePageObj);
    }

    return result;
};

module.exports = dataHelper;