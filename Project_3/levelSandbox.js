/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
exports.addLevelDBData = function(key, value) {
    return new Promise(function(resolve, reject) {
        db.put(key, value, function(err) {
            if (err) {
                console.log('Block ' + key + ' submission failed', err);
                reject(err);
            } else {
              resolve(value);
            }
        });
    });
}

// Get data from levelDB with key
exports.getLevelDBData = function (key){
  let self = this;
  return new Promise((resolve, reject) => {
    db.get(key, function(err, value) {
        if (err){
          console.log('Not found!', err);
          reject(err);
        } else {
          resolve(value);
      }
    });
  });
}

// Add data to levelDB with value
exports.addDataToLevelDB = function (value) {
  let self = this;
  return this.getBlockCount().then((count) => {
    console.log("Adding value for Key:" + count);
    return self.addLevelDBData(count, value);
  });
}


exports.getBlockCount = function() {
  let count = 0;  
  return new Promise(function(resolve, reject) {

    db.createReadStream().on('data', function(data) {
        count++;
      }).on('error', function(err) {
          return console.log('Unable to read data stream!', err)
          reject(err);
      }).on('close', function() {
        console.log('Current Block Count:' + count);
        resolve(count);
      });  
    });
}
/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
