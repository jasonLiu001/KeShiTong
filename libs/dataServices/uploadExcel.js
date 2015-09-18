var xlsxj = require('../xlsx-to-json');
var multer = require('multer');
var path = require('path');
var config = require('../../config');

var fileName = '';
var excelUploader = {
    init: function () {
        //var upload=multer({dest:'uploads/'});
        var storage = multer.diskStorage({
            destination: config.uploadFilePath.filePath,
            // You can set the custom name on it,
            // In this it will pass the file name to other api for Exel to json
            filename: function (req, file, cb) {
                fileName = file.fieldname + '-' + Date.now();
                cb(null, fileName);
            }
        });

        var uploader = multer({dest: config.uploadFilePath.filePath, storage: storage});
        return uploader;
    },
    excel2Json: function (callback) {
        var filePath = path.join(config.uploadFilePath.filePath, fileName);
        xlsxj({
                input: filePath,
                output: null
            }, function (err, result) {
                callback(err, result);
            }
        );
    }
};


module.exports = excelUploader;