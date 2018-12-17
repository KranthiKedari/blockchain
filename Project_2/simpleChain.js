/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Importing levelSandbox.
var levelSandbox = require('./levelSandbox.js');

const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
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
  addBlock(newBlock){
    let self = this;
    return new Promise(function(resolve, reject) {
      // Block height
      self.getBlockHeight().then((height) => {
        return height;
      }).then((blockHeight) => {
        //Check if chain is empty. if so add the genesis block.
        return self.maybeAddGenesisBlock(blockHeight);
      }).then((blockHeight) => {
        newBlock.height = blockHeight;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3); 
        return Promise.resolve(self.getBlock(blockHeight - 1));
        
      }).then((blockJson) => {
        if(blockJson != undefined && blockJson.length > 0) {
          console.log("Block data:" + blockJson);
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
        //console.log("New block hash:" + newBlock.hash);
        // Adding block object to chain
        self.storeBlockInDb(JSON.stringify(newBlock).toString());
        resolve("done:"+ JSON.stringify(newBlock));
        //resolve();
      })
    });
  }

  maybeAddGenesisBlock(blockHeight) {
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
      return Promise.resolve(blockHeight);
    }  
  }
  

  storeBlockInDb(newBlock) {
    return levelSandbox.addDataToLevelDB(newBlock);
  }
  // Get block height
  getBlockHeight(){
    // Load the current block count from the level DB.
    return levelSandbox.getBlockCount();
  }

  // get block
  getBlock(blockHeight){
    // return object as a single string
    console.log("getting block for height:" + blockHeight);
    return levelSandbox.getLevelDBData(blockHeight);     
  }

  // validate block
  validateBlock(blockHeight){
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getBlock(blockHeight).then((blockJson) => {
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
            resolve(true);
          } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            resolve(false);
          }
        });
     });
  }

 // Validate blockchain
  validateChain(){
    // let errorLog = [];

    // for (var i = 0; i < getBlockHeight() - 1; i++) {
    //   // validate block
    //   if (!this.validateBlock(i))errorLog.push(i);
    //   // compare blocks hash link
    //   let blockHash = this.chain[i].hash;
    //   let previousHash = this.chain[i+1].previousBlockHash;
    //   if (blockHash!==previousHash) {
    //     errorLog.push(i);
    //   }
    // }
    // if (errorLog.length>0) {
    //   console.log('Block errors = ' + errorLog.length);
    //   console.log('Blocks: '+errorLog);
    // } else {
    //   console.log('No errors detected');
    // }

    let promises = [];
    this.getBlockHeight().then((height) => {
      for (var i = 0; i <height-1; i++) {
        promises.push(this.validateBlock(i));
      }

      Promise.all(promises).then(function(values) {
        let isBlockchainValid = true;
        for(var i=0;i<values.length; i++) {
          if(values[i] == false) {
            isBlockchainValid = false;
            break;
          }
        }

        if(isBlockchainValid) {
          console.log("Block chain is valid.");
        } else {
          console.log("Block chain validation failed.");
        }
      })
    });
  }
}

myBlockChain = new Blockchain();
// (function theLoop (i) {
//     setTimeout(function () {
//         let blockTest = new Block("Test Block - " + (i + 1));
//         myBlockChain.addBlock(blockTest).then((result) => {
//             console.log(result);
//             i++;
//             if (i < 10) theLoop(i);
//         });
//     }, 4000);
//   })(0);

myBlockChain.validateChain();
  
