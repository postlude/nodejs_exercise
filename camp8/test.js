/*
var test = function(a, b){
    return {
        message : "hello",
        value : "world"
    }
};

var test = (a, b) => {
    return {
        message : "hello",
        value : "world"
    }
};

var test = (a, b) => ({
    message : "hello",
    value : "world"
});


// parameter 1개인 경우에는 아래와 같이 사용 가능
var test = a => ({
    message : "hello",
    value : "world"
});
*/

/*
var p1 = new Promise(
    function(resolve, reject) {
        console.log("프라미스 함수제작");
        // 0.5초 뒤에 콘솔에 찍습니다.
        setTimeout(
            function() {
                // 프라미스 이행 될때 실행할 부분을 resolve로 적습니다.
                resolve( console.log("프라미스 이행") );
            },
            500
        );
    }
);

// promise 실행 종료 후 안의 내용(console.log) 실행
p1.then( ()=>{
    console.log("프라미스 완료!");
});
*/

/*
var p1 = new Promise(
    function(resolve, reject) {
        console.log("프라미스 함수제작");
        //0.5초 뒤에 콘솔에 찍습니다.
        setTimeout(
            function() {
                //프라미스 이행 될때 실행할 부분을 resolve로 적습니다.
                //리턴할 변수를 적는다.
                resolve({ p1 : "^_^" });
            }, 500 );
    }
);

p1.then( (result)=>{ //받을 변수명을 result로 정했다.
    console.log("리턴 값을 출력해본다 : " + result.p1);
});
*/

/*
var p1 = new Promise(
    function(resolve, reject) {
        console.log('p1 promise');
        //0.5초 뒤에 콘솔에 찍습니다.
        setTimeout(
            function() {
                resolve({ p1result : "p1" });
            }, 500 );
    }
);

var p2 = new Promise(
    function(resolve, reject) {
        // console.log("프라미스 함수제작");
        console.log('p2 promise');
        //0.3초 뒤에 콘솔에 찍습니다.
        setTimeout(
            function() {
                resolve({ p2result : "p2" });
            }, 300 );
    }
);

// 실행 순서는 선언된 순서대로 실행됨
// 배열 순서 바꿔봤자 순서 안바뀜
Promise.all([p1,p2]).then( (result) =>{
    console.log(result);
    console.log( "p1 = " + result[0].p1result);
    console.log( "p2 = " + result[1].p2result);
});
*/

function* iterFunc(){
    console.log('not yield');
    yield console.log('1');
    yield console.log('2');
    yield console.log('3');
    yield console.log('4');
}

var iter = iterFunc();
iter.next();
iter.next();
iter.next();
iter.next();
iter.next(); // 아무것도 출력 안됨
