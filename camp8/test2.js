/*var test = (a, b) => {
    var c = a + b;
    return {
        c : c,
        message : "hello",
        value : "world"
    }
};

console.log(test(1, 2));
*/


// arrow function binding
// function(){}방식으로 호출할 때
function objFunction() {
    console.log('Inside `objFunction`:', this.foo);
    return {
        foo: 25,
        bar: function () {
            console.log('Inside `bar`:', this.foo);
        },
    };
}
objFunction.call({ foo: 13 }).bar(); // objFunction의 `this`를 오버라이딩합니다.

console.log('------------------------------');

// Arrow Function방식으로 호출할 때
// function objFunction() {
//     console.log('Inside `objFunction`:', this.foo);
//     return {
//         foo: 25,
//         bar: () => console.log('Inside `bar`:', this.foo),
//     };
// }
// objFunction.call({ foo: 13 }).bar(); // objFunction의 `this`를 오버라이딩합니다.