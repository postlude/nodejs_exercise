function* iterFunc(){
    // console.log('not yield');
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
