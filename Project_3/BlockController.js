const SHA256 = require('crypto-js/sha256');
const privateChain  = require('./simpleChain.js');

const Blockchain = new privateChain.Blockchain();
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
        this.initializeBlockChain();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/api/block/:index", (request, response) => {
            // Add your code here
            let blockHeight = parseInt(request.params.index, 10);
            if(blockHeight == undefined || blockHeight < 0) {
                response.status(500).send('ERROR:Invalid block blockHeight/ blockheight missing.');
            }

            let currentBlockHeight = 0;
            this.blockchain.getBlockHeight().then((height) => {
                currentBlockHeight = parseInt(height, 10);
                console.log("Current Block height:" + currentBlockHeight);
                console.log("Requested Block height:" + blockHeight);
                if(currentBlockHeight < blockHeight) {
                    response.status(500).send('ERROR: Current block height is less than the given block height.');
                }
            })

            this.blockchain.getBlock(blockHeight).then((blockJson) => {
                if(blockJson == undefined) {
                    response.status(500).send('ERROR:Error loading block data from the block chain.');
                }

                response.status(200).json(JSON.parse(blockJson));
            })
            .catch((err) => {
                response.status(500).send('ERROR: Error retrieving the block at height:' + blockHeight);
            })         
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/api/block", (request, response) => {
            let contentType = request.headers['content-type'];
            if (!contentType || contentType.indexOf('application/json') !== 0) {
                response.status(403).send("Denied: Invalid contentType. use application/json.")
            }
           
            let blockJson = request.body;
            console.log(blockJson);
            if(blockJson == undefined) {
                response.status(500).send("ERROR:Invalid request body.")
            }

            let blockData = blockJson.body;

            if(!blockData) {
                response.status(500).send('ERROR: Block body is empty. use {"body" : "Block data"} as request body.' );
            }
            
            console.log("adding new block with text:" + blockData);
            this.blockchain.addBlock(new privateChain.Block(blockData)).then((result) => {
                response.status(200).send("Successfully added the block.")
            })
            .catch((err) => {
                response.status(500).send('ERROR: Error while adding a new block');
            })  
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        this.app.post("/test/populate", (req, res) => {
            let self = this;
          (function theLoop (i) {
            setTimeout(function () {
                let blockTest = new privateChain.Block("Test Block - " + (i + 1));
                self.blockchain.addBlock(blockTest).then((result) => {
                  console.log(result);
                  i++;
                  if (i < 10) theLoop(i);
                });
            }, 2000);
            })(0);
        });
    }

    initializeBlockChain() {
        this.blockchain = Blockchain;
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}