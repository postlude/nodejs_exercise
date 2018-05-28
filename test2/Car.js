function Car(){
    this.color = "Red ";
}
    
Car.prototype.log = function () {
    console.log("this Car is " + this.color);
}
module.exports = Car;