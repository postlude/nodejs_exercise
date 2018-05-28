// console.log('nodejs');

// var myvar = require('./myvar');
// 동일 효과
// var myvar = require('./myvar.js');

// console.log(myvar.a);


// var myvar = require('./myvar');
// var setA = myvar.a();
// console.log(setA);


// var Myvar = require('./myvar');
// var setVar = new Myvar();
// console.log(setVar.name);


var Car = require('./Car');
var myCar = Object.create(Car.prototype);
// Car.call(myCar);
myCar.log();