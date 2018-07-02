//#예제 1.
// var A = function () {
//     this.x = function () {
//          console.log('hello');
//     };
// };
// A.x=function() {
//     console.log('world');
// };

// var B = new A();
// var C = new A();

// B.x();
// C.x();


//#예제 2.
// var A = function () { };

// A.x=function() {
//     console.log('hello');
// };
// // A.prototype.x = function () {
// //      console.log('world');
// // };

// var B = new A();
// var C = new A();

// A.x();
// B.x();
// C.x();



// function Car(){ }
// var myCar = new Car(); 
// console.log(myCar.constructor===Car);
// // 생성자는 Car
// console.log(myCar.constructor.prototype===Car.prototype);
// // myCar의 생성자가 가르키는 prototype은 Car의 prototype
// console.log(myCar.constructor===myCar.constructor.prototype.constructor);


// function Car(){
//     this.name = "첫번째";
//     this.title = "타이틀"
//     this.func = function(){
//         console.log("car function");
//     }
// }
// Car.prototype.pro1 = "val1";
// Car.prototype.pro2 = "val2";
// var myCar = new Car();
// var myCar = new Car();
// var prop;
// for(prop in myCar){
//     // console.log(prop);

//     if(myCar.hasOwnProperty(prop)){
//         // console.log(prop + " = "+ myCar[prop]);
//         console.log(myCar[prop]);
//     }
// }



var a = [];
console.log(Array.prototype.isPrototypeOf(a));

var a = {};
console.log(Object.prototype.isPrototypeOf(a));

function a(){}
console.log(Function.prototype.isPrototypeOf(a));
