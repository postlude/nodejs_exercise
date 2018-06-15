var test = (a, b) => {
    var c = a + b;
    return {
        c : c,
        message : "hello",
        value : "world"
    }
};

console.log(test(1, 2));