var TabScanner = require('../index.js');
var fs = require('fs');
var image = fs.readFileSync(__dirname + "/waitrose_22_06.jpg");

var fixtures = require(__dirname + '/fixtures.js');

var tb = new TabScanner("yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm");
tb.parseReceipt(image,true).then(result => {
    console.log(result);
})