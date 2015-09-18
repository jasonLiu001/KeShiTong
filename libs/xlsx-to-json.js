var fs = require('fs');
var xlsx = require('xlsx');
var cvcsv = require('csv');

exports = module.exports = XLSX_json;

function XLSX_json(config, callback) {
    if (!config.input) {
        console.error("You miss a input file");
        process.exit(1);
    }

    var cv = new CV(config, callback);

}

function CV(config, callback) {
    var wb = this.load_xlsx(config.input)
    var dataSource=[];
    var num=0;
    for(var i=0;i< wb.SheetNames.length;i++){
        var ws = this.ws(wb,wb.SheetNames[i]);
        var csv = this.csv(ws);
        var cvjCallBack= function(error,result){
            dataSource.push({sheetName:wb.SheetNames[num],data:result});
            num++;
            if(num==wb.SheetNames.length)
            {
                callback(null,dataSource);
            }
        };
        this.cvjson(csv, cvjCallBack);
    }
}

CV.prototype.load_xlsx = function (input) {
    return xlsx.readFile(input);
}

CV.prototype.ws = function (wb,wbSheetName) {
    var target_sheet = '';

    if (target_sheet === '')
        target_sheet = wbSheetName;
    ws = wb.Sheets[target_sheet];
    return ws;
}

CV.prototype.csv = function (ws) {
    return csv_file = xlsx.utils.make_csv(ws)
}

CV.prototype.cvjson = function (csv, callback) {
    var record = [];
    var header = [];

    cvcsv().from.string(csv)
        .transform(function (row) {
            row.unshift(row.pop());
            return row;
        })
        .on('record', function (row, index) {
            if (index === 0) {
                header = row;
            }
            else {
                var obj = {};
                header.forEach(function (column, index) {
                    obj[column.trim()] = row[index].trim();
                })
                record.push(obj);
            }
        })
        .on('end', function (count) {
            callback(null, record);
        })
        .on('error', function (error) {
            callback(error.message);
        });
}