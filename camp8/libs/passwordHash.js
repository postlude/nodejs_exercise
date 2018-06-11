var crypto = require('crypto');
var mysalt = "fastcampus";

module.exports = function(password){
    // 단방향 암호화
    return crypto.createHash('sha512').update(password + mysalt).digest('base64');
};