/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Importing levelSandbox.
const levelSandbox = require('./levelSandbox.js');
const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.timestamp = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain{
  constructor(){
  }

  // Add new block
  async addBlock(newBlock){
    let self = this;
    return new Promise(function(resolve, reject) {
      // Block height
      self.getBlockHeight().then((height) => {
        return height;
      }).then((blockHeight) => {
        //Check if chain is empty. if so add the genesis block.
        let promise = self.maybeAddGenesisBlock(blockHeight);
        return promise;
      }).then((blockHeight) => {
        console.log('currentBlock height:' + blockHeight);
        newBlock.height = blockHeight;
        // UTC timestamp
        newBlock.timestamp = new Date().getTime().toString().slice(0,-3); 
        return Promise.resolve(self.getBlock(blockHeight - 1));
        
      }).then((blockJson) => {
        if(blockJson != undefined && blockJson.length > 0) {
          console.log("Previous Block data:" + blockJson);
          let previousBlockHash = JSON.parse(blockJson).hash;
          console.log("prevHash:" + previousBlockHash );

          return Promise.resolve(previousBlockHash);
        } 

        return Promise.resolve("");
      })
      .then((previousBlockHash) => {
        // Add prevhash
        if(previousBlockHash != undefined) {
          newBlock.previousBlockHash = previousBlockHash
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        // Uncomment the next three lines to corrupt 4 and 6 blocks for testing
        // if(newBlock.height == 4 || newBlock.height == 6) {
        //   newBlock.data = "Corrupting Block :" + newBlock.height;
        // }

        // Adding block object to chain
        self.storeBlockInDb(JSON.stringify(newBlock).toString());
        resolve(JSON.stringify(newBlock));
        //resolve();
      })
    });
  }

  // Checks if the blockchain is empty and adds a genesis block if it is empty.
  async maybeAddGenesisBlock(blockHeight) {
    if( blockHeight == 0) {
      console.log("Adding genesis block");
      let genesisBlock = new Block("First block in the chain - Genesis block");
      genesisBlock.height = 0;
      genesisBlock.timestamp =  new Date().getTime().toString().slice(0,-3);
      genesisBlock.previousBlockHash = '';
      genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
      var promise = this.storeBlockInDb(JSON.stringify(genesisBlock).toString()).then((result) => {
        return Promise.resolve(blockHeight + 1);
      });

      return promise;
    } else {
      return Promise.resolve(blockHeight + 1);
    }  
  }
  

// Stores the block in the levelDB
  storeBlockInDb(newBlock) {
    return levelSandbox.addDataToLevelDB(newBlock);
  }
  // Get block height
  async getBlockHeight(){
    // Load the current block count from the level DB.
    return await levelSandbox.getBlockCount().then((count) => {
      if (count == 0) {
        return Promise.resolve(count);
      } else {
        return Promise.resolve(count - 1);
      }
    });
  }

  // get block
  getBlock(blockHeight){
    // return object as a single string
    //console.log("getting block for height:" + blockHeight);
    return levelSandbox.getLevelDBData(blockHeight);     
  }

  // validate block
  validateBlock(blockHeight){
    let self = this;
    
    return self.getBlock(blockHeight).then((blockJson) => {
        // get block object
        let block =JSON.parse(blockJson);
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
          console.log("Block valid for height:" + blockHeight);
          return Promise.resolve(true);
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return Promise.resolve(false);
        }
      });
     
  }

  // Validates a block link by checking the hash of a block to the prevHash of the next block.
  validateBlockLink(blockHeight) {
    let nextBlockHeight = blockHeight + 1; 
    return this.getBlock(blockHeight).then((blockJson) => {
      let currentBlockHash = JSON.parse(blockJson).hash;

      return this.getBlock(nextBlockHeight).then((nextBlockJson) => {
        let nextBlockHash = JSON.parse(nextBlockJson).previousBlockHash;
        if(currentBlockHash !== nextBlockHash) {

          return Promise.resolve(false);
        } else {
          return Promise.resolve(true);
        }
      })
    })


  }

  // Validate a block and checks the block link at a particular height.
  validateBlockAndBlockLink(height, totalCount) {
    let blockHeight = height;
     return this.validateBlock(blockHeight).then((isValid) => {
            if(isValid == true) {
              if(blockHeight < (totalCount) ) {
                  console.log("validating block link for blocks :"  + blockHeight +" and " + (blockHeight+1)); 

                // we validate all blocks but we cant do link validation for the last block.
                // if there are 3 blocks, we validate links 0-1, 1-2 and 2-3 only
               return this.validateBlockLink(blockHeight).then((linkValid) => {
                    if(linkValid === false) {
                      return Promise.resolve(false);
                    } else {
                      //console.log("Block link valid for height:" + blockHeight);
                      return Promise.resolve(true);
                    }
                  });
              } else {
                return Promise.resolve(true);
              }
            } else {
              return Promise.resolve(false);
            }
          });
  }


 // Validates the entire block chain.
  validateChain(){
    this.getBlockHeight().then((height) => {
      //console.log("Total blocks(including genesis):" + height);
      //validate all the blocks and then validate all the block links
      let promises = []
      let totalCount = height;
      for (var i = 0; i <=height; i++) {
       let blockHeight = i; 
       promises.push(this.validateBlockAndBlockLink(blockHeight, totalCount));

      }

      return Promise.resolve(promises);

    }).then((promises) => {
      Promise.all(promises).then((values) => {
        for(var i =0;i< values.length; i++) {
          if( values[i] === false) {
            console.log("Block => " + i + " is invalid");
          } else {
            console.log("Block => " + i + " is valid");
          }
        }
      })
    });

   }
}

module.exports.Block = Block
module.exports.Blockchain = Blockchain
