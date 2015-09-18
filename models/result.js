/**
 * Created by issuser on 2015/7/29.
 */

//rebomongo

var status = {
    success: 200,
    error : 500,
    unauthorized: 401
}
module.exports = {
    success : function(p){
        if(p != undefined){
            if  (typeof  p === "string"){
                return {
                    status : status.success,
                    data: true,
                    message:p
                }
            }else   {
                return {
                    status : status.success,
                    data: p,
                    message:""
                };
            }
        }else {
            return {
                status : status.success,
                data: true,
                message:""
            };
        }

    },error: function (p) {
        return {
            status : status.error,
            data: false,
            message : p
        }
    }


};