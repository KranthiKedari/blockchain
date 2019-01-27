const bitcoinMessage = require('bitcoinjs-message'); 
const util = require('./util.js')
const validation_timeout = 300;

class MempoolController {

	constructor() {
		this.mempool = [];
		this.timeoutRequests = [];
	    this.timeoutSeconds = validation_timeout;
	}


	addNewValidation(walletAddress) {
	  let validationRequestContent = this.constructValidationRecord(walletAddress);
	  this.mempool[walletAddress] = validationRequestContent;

	  let self = this;
	  self.timeoutRequests[walletAddress]=setTimeout(function(){ self.removeValidationRequest(walletAddress) }, self.timeoutSeconds * 1000);

	  console.log(this.mempool);

	  return validationRequestContent;
	}


	removeValidationRequest(walletAddress) {
		delete this.mempool[walletAddress];
		delete this.timeoutRequests[walletAddress];


		console.log(this.mempool)
	} 


	validateRequestByWallet(walletAddress, signature) {
        let record = this.mempool[walletAddress]
        let response = {}

        if(record == undefined) {
        	return util.constructError("Error: Validation request not present/ expired.")
        }

		let isValid = bitcoinMessage.verify(record.message, record.walletAddress, signature);

        if (isValid === true) {
          record['messageSignature'] = true;
          console.log("Signature is valid")
        } else {
          record['messageSignature'] = false;
        }

        return this.constructValidationRecord(walletAddress);
	}

	hasValidation(walletAddress) {
		console.log(this.mempool[walletAddress]);
		return this.mempool[walletAddress] != undefined && this.mempool[walletAddress].messageSignature === true;
	}

    constructValidationRecord(walletAddress) {
    	let timestamp = new Date().getTime().toString().slice(0,-3);
    	let message = walletAddress + ":" + timestamp +":" + "starRegistry"
        let record = this.mempool[walletAddress]
    	let timeoutSeconds = this.timeoutSeconds
        let messageSignature = false;

    	if(record) {
    		timeoutSeconds = this.timeoutSeconds - (timestamp - this.mempool[walletAddress].requestTimeStamp);
    		timestamp = this.mempool[walletAddress].requestTimeStamp;
    		message = this.mempool[walletAddress].message;
    		if(record['messageSignature'] === true) {
    			messageSignature = true;
    		}
    	} 
    
		let response =  {'walletAddress': walletAddress, 'requestTimeStamp' : timestamp, 'message' : message, 'validationWindow' : timeoutSeconds};

		if(messageSignature === true) {
			response['messageSignature'] = true
		}

		return response;
    }


}

module.exports.MempoolController = MempoolController