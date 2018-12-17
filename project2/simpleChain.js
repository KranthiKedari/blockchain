const SHA256 = require('crypto-js/sha256');

class Block {
	constructor(data) {
	   this.hash ='';
	   this.height = '';
	   this.data = data;
	   this.timeStamp = '';
	   this.previousHash ='';
	}
} 

class Blockchain {
	constructor() {
		this.chain = [];
		this.addBlock(this.createGenesisBlock());
	}

	createGenesisBlock() {
		return new Block("This is the first block of the blockchain.");
	}

	addBlock(block) {
		if(this.chain.length > 1) {
		  var prevBlock = this.chain[this.chain.length - 1];

		  block.previousHash = prevBlock.hash;
		}
		block.height = this.chain.length;
		block.timeStamp = new Date().getTime().toString().slice(0,-3);
		block.hash = SHA256(JSON.stringify(block)).toString();		
		this.chain.push(block);
	}
}

var chain = new Blockchain();

chain.addBlock(new Block("This is the first block that is added"));
console.log(chain)  