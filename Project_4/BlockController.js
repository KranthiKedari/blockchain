const SHA256 = require('crypto-js/sha256');
const privateChain  = require('./simpleChain.js');

const Blockchain = new privateChain.Blockchain();
const util = require('./util.js')
const star = require('./star.js')
/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.mempoolController =util.getMempool()

        this.initializeBlockChain();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", (request, response) => {
            // Add your code here
            let blockHeight = parseInt(request.params.index, 10);
            if(blockHeight == undefined || blockHeight < 0) {
                return response.status(500).json(this.constructError('ERROR:Invalid block blockHeight/ blockheight missing.'));
            }

            let currentBlockHeight = 0;
            this.blockchain.getBlockHeight().then((height) => {
                currentBlockHeight = parseInt(height, 10);
                console.log("Current Block height:" + currentBlockHeight);
                console.log("Requested Block height:" + blockHeight);
                if(currentBlockHeight < blockHeight) {
                    return response.status(500).json(this.constructError('ERROR: Current block height is less than the given block height.'));
                } else {
                     this.blockchain.getBlock(blockHeight).then((blockJson) => {
                        if(blockJson == undefined) {
                            return response.status(500).json(this.constructError('ERROR:Error loading block data from the block chain.'));
                        }

                        let blockData = JSON.parse(blockJson)
                        let blockBody = blockData.body

                        if(blockBody.star != undefined) {
                            let starData = new star.star(blockBody.star)
                            starData.addDecodedStory();
                            blockBody.star = starData;
                            blockData.body = blockBody;
                        }

                        response.status(200).json(blockData)
                    })
                    .catch((err) => {
                        response.status(500).json(this.constructError('ERROR: Error retrieving the block at height:' + blockHeight));
                    })   
                }
            });
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (request, response) => {
            let contentType = request.headers['content-type'];
            if (!contentType || contentType.indexOf('application/json') !== 0) {
                response.status(403).json(this.constructError("Denied: Invalid contentType. use application/json."))
            }
           
            let blockData = request.body;
            console.log("Request body:" + JSON.stringify(blockData));
            if(JSON.stringify(blockData) === JSON.stringify({})) {
                return response.status(500).json(this.constructError("ERROR:Invalid/Empty request body."));
            }

            // Check if wallet address is present
            if(blockData.address == undefined) {
                return response.status(500).json(this.constructError('ERROR: Invalid/Empty Wallet address.' ));
            }

            // check if star data is given in the request.
            if(blockData.star == undefined) {
                return response.status(500).json(this.constructError('ERROR: Invalid/Empty Star data.' ));
            }

            let walletAddress = blockData.address;
            let starData = blockData.star;

            console.log(walletAddress + ":Star:"+ starData)

            // Now check if the validation is present for the wallet address.
            if(!this.mempoolController.hasValidation(walletAddress)) {
                return response.status(500).json(this.constructError('ERROR: Validation doesnt exist in mempool.' ));
            }

            // Here we can assume the data is present in the request and the validation exists in mempool.
            // Time to add the star data.
            if(starData.ra == undefined || starData.dec == undefined || starData.story == undefined) {
                return response.status(500).json(this.constructError('ERROR: Invalid/Incomplete star data.' ));
            } 

            let star_obj = new star.star(starData);
            star_obj.encodeStory()
            blockData.star = star_obj

            this.mempoolController.removeValidationRequest(walletAddress);
            console.log("adding new block with text:" + blockData);
            this.blockchain.addBlock(new privateChain.Block(blockData)).then((result) => {
                response.status(200).json(JSON.parse(result));
            })
            .catch((err) => {
                response.status(500).json(this.constructError('ERROR: Error while adding a new block'));
            })  
        });
    }

    initializeBlockChain() {
        this.blockchain = Blockchain;
    }

    constructError(errorMsg) {
        let error = {}
        error.error = true
        error.message = errorMsg

        return error
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}