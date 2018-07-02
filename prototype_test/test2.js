function Person(){
    this.name = "hello";
}
Person.prototype.speack = function(){
    console.log(this.name + " speack");
};
var myMan = Object.create(Person.prototype);
Object.defineProperties(myMan ,{
    name : {
        value : "myMan",
        writable : true
    },
    hold : {
        // java getter, setter 처럼 사용됨
        get : function(){
            console.log(this.name + " hold");
        },
        set : function(value){
            this.name = value;
            console.log('set hold function');
        }
    }
});
// set 호출
myMan.hold = "hello";
// get 호출
myMan.hold;