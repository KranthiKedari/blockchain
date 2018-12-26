 
This project is to integrate the private block chain with REST API.

I used mostly the code I wrote for the private blockchain for the previous project.

Node js Framework used: 
----------------------
express-js

Additional libraries added:
--------------------------
express-prettify - To view the json in a pretty format


Server:
-------
Local server runs at 8000 port

Instructions to start the server:
---------------------------------
npm install
node app.js



End points
-----------

1) GET localhost:8000/api/block/blockNumber[?json=1]
-----------------------------------------------------
Retrives the block from the private block chain. Error if bloack not found or invalid height (status: 500)
e:g 
GET localhost:8000/api/block/0 
The above example retrieves the genesis block.

GET localhost:8000/api/block/1?json=1
The above example retrieves block 1 and makes the json response pretty



2) POST localhost:8000/api/block
--------------------------------
Creates a new block with given data.

Headers: only allows "Content-type": "application/json"
returns a 403 if any other header is provided.

Request body: JSON body
e:g:

{
  "body":"block data goes here"
}

Returns a 500 if body is not present


3) POST localhost:8000/test/populate/
------------------------------------
I made this is an end point instead of populating automatically

Use this end point to add 10 blocks to the block chain