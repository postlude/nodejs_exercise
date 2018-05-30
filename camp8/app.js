var express = require('express');
// 반드시 이 위치에
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//MongoDB 접속
var mongoose = require('mongoose');
// mongoose promise 에러 처리
// promise 가 deprecation 되었으므로 다른것으로 교체 바람
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');
 
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log('mongodb connect');
});
 
var connect = mongoose.connect('mongodb://127.0.0.1:27017/fastcampus', { useMongoClient: true });
autoIncrement.initialize(connect);


// 반드시 express 아래
var admin = require('./routes/admin');

var app = express();
var port = 3000;

// 현재 디렉토리 위치
// console.log(__dirname);
// 확장자가 ejs 로 끝나는 뷰 엔진을 추가한다.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 반드시 이 위치에(port 아래)

// 미들웨어 셋팅
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.get('/', function(req, res){
    res.send('first edit');
});

// app.get('/admin', function(req, res){
//     res.send('admin app');
// });

app.use('/admin', admin);

app.listen( port, function(){
    console.log('Express listening on port', port);
});