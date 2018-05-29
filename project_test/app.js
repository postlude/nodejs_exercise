var express = require('express');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


var app = express();
var port = 3000;

// db 관련
var db = mongoose.connection;
// db 연결 실패했을 때 콘솔에 메시지
db.on('error', console.error);
// once() : Adds a one time listener for the event. This listener is invoked only the next time the event is fired, after which it is removed.
db.once('open', function(){
    console.log('mongodb connect');
});

// useMongoClient - This is a mongoose-specific option (not passed to the MongoDB driver) that opts in to mongoose 4.11's new connection logic.
// If you are writing a new application, you should set this to true.
var connect = mongoose.connect('mongodb://127.0.0.1:27017/fastcampus_test', { useMongoClient: true });
autoIncrement.initialize(connect);


// var router = express.Router();
// router.get('/test', function (req, res) {
//     res.send('test');
// });
// app.use('/admin', router);


var admin = require('./routes/admin');
app.use('/admin', admin);


app.listen(port, function () {
    console.log('Express listening on port', port);
});