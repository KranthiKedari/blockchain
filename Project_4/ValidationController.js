
const util = require('./util.js')


class ValidationController {
	constructor(app) {
        this.app = app;
        this.mempoolController =util.getMempool()
        this.postRequestValidation()
        this.postValidate()
    }

    // POST /requestValidation - To create a validation request
    postRequestValidation() {
        this.app.post("/requestValidation", (request, response) => {
        	let validationResponse = util.validateRequest(request);

        	if(validationResponse.error) {
        		return response.status(validationResponse.code).json(validationResponse.data);
        	}

        	// Safe to assume the validation is successful
        	let validationrequest = request.body;

        	if(validationrequest.address == undefined) {
        		return response.status(500).json(util.constructError('ERROR: Invalid/Empty wallet address'));
        	}

        	let walletAddress = validationrequest.address;

        	response.status(200).json(this.mempoolController.addNewValidation(walletAddress));
        });
    }


    postValidate() {
    	 this.app.post("/message-signature/validate", (request, response) => {
        	let validationResponse = util.validateRequest(request);

        	if(validationResponse.error) {
        		return response.status(validationResponse.code).json(validationResponse.data);
        	}

        	// Safe to assume the validation is successful

        	let validationrequest = request.body;

        	if(validationrequest.address == undefined) {
        		return response.status(500).json(util,constructError('ERROR: Invalid/Empty wallet address'));
        	}

        	if(validationrequest.signature == undefined) {
        		return response.status(500).json(util,constructError('ERROR: Invalid/Empty signature'));
        	}

        	let walletAddress = validationrequest.address;
        	let signature = validationrequest.signature;

        	response.status(200).json(this.mempoolController.validateRequestByWallet(walletAddress, signature));
        });
    }
}

module.exports = (app) => { return new ValidationController(app);}