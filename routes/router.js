//Service API routes
var accountService = require('./api/account');
var dataService = require('./api/data');
var routerAuth = require('./routerAuthentication');

/**
 * api router collection to store all service api. *
 * */
function routerCollection(requestListener) {
    //Service API routes
    requestListener.use('/', routerAuth);
    requestListener.use('/api/account', accountService);
    requestListener.use('/api/data', dataService);
}

exports.registerServiceAPI = function (requestListener) {
    return new routerCollection(requestListener);
};