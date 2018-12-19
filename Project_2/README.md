 
This project is to create a private blockchain that can be persisted in levelDB.

This includes functionality that would add blocks to the chain and validation function that validates a block individually using its hash as well as the chain link



USAGE DETAILS:
 //myBlockChain = new Blockchain();

 //Step 1: Create 10 blocks.
 // NOTE : If you want to corrupt a few blocks(4, 6) uncomment lines 68 -70
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

// Step 2: Validate blockchain
//myBlockChain.validateChain();
  