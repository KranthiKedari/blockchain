
const mempool_lib = require('./MempoolController.js')

exports.validateRequest = function(request) {
    let contentType = request.headers['content-type'];
    if (!contentType || contentType.indexOf('application/json') !== 0) {
    	return {'error' : true, 'code' : 403,  'data' : this.constructError('Denied: Invalid contentType. use application/json.')}
    }
   
    let blockJson = request.body;
    console.log("Request body:" + JSON.stringify(blockJson));
    if(JSON.stringify(blockJson) === JSON.stringify({})) {
    	return {'error' : true, 'code' : 500,  'data' : this.constructError('ERROR:Invalid/Empty request body.')}
    }

    return {'success' : true};
}


exports.constructError = function(errorMsg) {
        let error = {}
        error.error = true
        error.message = errorMsg
        return error
}

exports.getMempool = function() {
  if(global.mempool_instance === undefined) {
    global.mempool_instance = new mempool_lib.MempoolController();
  }
  
  return global.mempool_instance;
}