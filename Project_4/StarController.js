const privateChain  = require('./simpleChain.js');

const Blockchain = new privateChain.Blockchain();
const star = require('./star.js')
const util = require('./util.js')


class StarController {
	constructor(app) {
        this.app = app;
        this.initializeBlockChain();
        this.getStarByHash();
        this.getStarsByAddress();
    }


    getStarByHash() {
    	this.app.get("/stars/hash::hash", (request, response) => {
         	// Safe to assume the validation is successful
        	let requestHash = request.params.hash
            console.log("Retriving block for blockHash: " + requestHash)
        	if(requestHash == undefined) {
        		return response.status(500).json(util.constructError('ERROR: Invalid/Empty block hash.'));
        	}

        	this.blockchain.getBlockHeight().then((height) => {
        		if(height === 0) {
        			return response.status(500).json(util.constructError('ERROR: Blockchain is empty.'));
        		}

        		let currentHeight = height;
        		while(currentHeight > 0) {

        				let blockAtHeight = this.checkBlockHashAtHeight(currentHeight, requestHash);
        				blockAtHeight.then((block) => {
        					if(block !== false) {
        						return response.status(200).json(block);
        					} 
        				});
   						currentHeight--;
        		}


        		return response.status(200).json({});	
        	});
        
        });
    }

    getStarsByAddress() {
		this.app.get("/stars/address::address", (request, response) => {
         	// Safe to assume the validation is successful
        	let requestAddress = request.params.address
            console.log("Retriving blocks for Adress: " + requestAddress)
        	if(requestAddress == undefined) {
        		return response.status(500).json(util.constructError('ERROR: Invalid/Empty wallet address.'));
        	}


        	this.blockchain.getBlockHeight().then((height) => {
        		if(height === 0) {
        			return response.status(500).json(util.constructError('ERROR: Blockchain is empty.'));
        		}

        		let promises = [];
        		for(var currentHeight = height; currentHeight > 0; currentHeight--) {
       				promises.push(this.checkBlockAddressAtHeight(currentHeight, requestAddress));
        		}

        		return Promise.resolve(promises);
        	}).then((promises) => {
        		 if(promises.length > 0){
      				Promise.all(promises).then((values) => {
      					let blocks = [];
        				for(var i =0;i< values.length; i++) {
          					if( values[i] !== false) {
          						blocks.push(values[i]);
          					}
            			}

            			response.status(200).json(blocks);
      				});
      			}
        	})
        
        });
    }



    async checkBlockHashAtHeight(height, hash) {
    	if(height == 0) {
    		return false;
    	}

    	return await this.blockchain.getBlock(height).then((blockJson) => {
			if(blockJson == undefined) {
	            return response.status(500).json(this.constructError('ERROR:Error loading block data from the block chain.'));
	        }

            let blockData = JSON.parse(blockJson)
            let blockHash = blockData.hash

            if(blockHash === hash) {
               let body = blockData.body
        	   let starData = new star.star(body.star);
        	   starData.addDecodedStory()
        	   blockData.body.star = starData;

               return Promise.resolve(blockData);
            } else {
                return Promise.resolve(false);
            }
        });

    }

     async checkBlockAddressAtHeight(height, walletAddress) {
    	if(height == 0) {
    		return false;
    	}

    	return await this.blockchain.getBlock(height).then((blockJson) => {
			if(blockJson == undefined) {
	            return response.status(500).json(this.constructError('ERROR:Error loading block data from the block chain.'));
	        }

            let blockData = JSON.parse(blockJson)
            let body = blockData.body
            let bodyAddress = body.address

            if(bodyAddress === walletAddress) {
         	   let starData = new star.star(body.star);
        	   starData.addDecodedStory()
        	   blockData.body.star = starData;

               return Promise.resolve(blockData);
            } else {
                return Promise.resolve(false);
            }
        });

    }

    initializeBlockChain() {
        this.blockchain = Blockchain;
    }
}

module.exports = (app) => { return new StarController(app);}
