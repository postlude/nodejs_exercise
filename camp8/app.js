var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// flash  메시지 관련
var flash = require('connect-flash');

// passport 로그인 관련
var passport = require('passport');
var session = require('express-session');

// MongoDB 접속
var mongoose = require('mongoose');
// mongoose promise 에러 처리
// promise 가 deprecation 되었으므로 다른것으로 교체 바람
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');

// db 접속 관련
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log('mongodb connect');
});
var connect = mongoose.connect('mongodb://127.0.0.1:27017/fastcampus', { useMongoClient: true });
autoIncrement.initialize(connect);


// 반드시 express 아래
var admin = require('./routes/admin');
var contacts = require('./routes/contacts');
var accounts = require('./routes/accounts');
var auth = require('./routes/auth');
var home = require('./routes/home');
var chat = require('./routes/chat');
var products = require('./routes/products');
var cart = require('./routes/cart');
var checkout = require('./routes/checkout');

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

// path 설정, 웹 상에서 접근 가능하게 됨
app.use('/uploads', express.static('uploads'));
// 아래와 같이 하면 routes 디렉토리 하위의 파일 내용을 웹 상에서 전부 볼 수 있게 됨
// app.use('/routes', express.static('routes'));

app.use('/static', express.static('static'));

// session 관련 셋팅
/*app.use(session({
    secret: 'fastcampus',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
}));*/
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);

var sessionMiddleWare = session({
    secret: 'fastcampus',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60
    })
});
app.use(sessionMiddleWare);

// passport 적용
// initialize 하면 req.isAuthenticated() 사용 가능
app.use(passport.initialize());
app.use(passport.session());

// 플래시 메시지 관련
app.use(flash());

// 로그인 정보 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 안난다
app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    // app.locals.myname = "한승덕";
    // app.locals.urlparameter = req.url; // 현재 url 정보를 보내고 싶으면 이와같이 셋팅
    // app.locals.userData = req.user; // 사용 정보를 보내고 싶으면 이와같이 셋팅
    next();
});

// 순서 바뀌어도 작동 잘 됨 but 가독성을 위해 '/'를 위나 아래에 넣는게 좋겠다.
app.use('/', home);
app.use('/admin', admin);
app.use('/contacts', contacts);
app.use('/accounts', accounts);
app.use('/auth', auth);
app.use('/chat', chat);
app.use('/products', products);
app.use('/cart', cart);
app.use('/checkout', checkout);

// app.get('/', function(req, res){
//     res.send('first edit');
// });

// app.get('/admin', function(req, res){
//     res.send('admin app');
// });

var server = app.listen( port, function(){
    console.log('Express listening on port', port);
});

var listen = require('socket.io');
var io = listen(server);
// socket io passport 접근하기 위한 미들웨어 적용
io.use(function(socket, next){
    sessionMiddleWare(socket.request, socket.request.res, next);
});
// var socketSetting = require('./libs/socketConnection');
// socketSetting(io);
// 위 두줄과 동일한 코드
require('./libs/socketConnection')(io);


/*
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//flash  메시지 관련
var flash = require('connect-flash');
 
//passport 로그인 관련
var passport = require('passport');
var session = require('express-session');

//MongoDB 접속
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');
 
var db = mongoose.connection;
db.on('error', console.error );
db.once('open', function(){
    console.log('mongodb connect');
});
 
var connect = mongoose.connect('mongodb://127.0.0.1:27017/fastcampus8', 
    { useMongoClient: true });
autoIncrement.initialize(connect);


var admin = require('./routes/admin');
var accounts = require('./routes/accounts');
var auth = require('./routes/auth');
var home = require('./routes/home');
var chat = require('./routes/chat');

var app = express();
var port = 3000;

// 확장자가 ejs 로 끈나는 뷰 엔진을 추가한다.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 셋팅
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//업로드 path 추가
app.use('/uploads', express.static('uploads'));

//session 관련 셋팅
app.use(session({
    secret: 'fastcampus',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
}));
 
//passport 적용
app.use(passport.initialize());
app.use(passport.session());
 
//플래시 메시지 관련
app.use(flash());

//로그인 정보 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 안난다
app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
    //app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅
    next();
});


app.use('/admin', admin);
app.use('/accounts', accounts);
app.use('/auth', auth);
app.use('/chat', chat);
app.use('/', home);

var server = app.listen( port, function(){
    console.log('Express listening on port', port);
});

var listen = require('socket.io');
var io = listen(server);
io.on('connection', function(socket){
    // console.log("socket 접속")
    socket.on('client message', function(data){
        // console.log(data);
        // 연결된 모든 클라이언트에게 전달
        io.emit('server message', data.message);
    });
});
*/