var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var passwordHash = require('../libs/passwordHash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/', function(req, res){
    res.send('account app');
});

// join
router.get('/join', function(req, res){
    res.render('accounts/join');
});
/*
router.post('/join', function(req, res){
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        displayname : req.body.displayname
    });

    // 중복된 id로는 회원 가입 불가
    UserModel.findOne({username : User.username}, function(err, existUser){
        if(!existUser){
            User.save(function(err){
                res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
            });
        }else{
            // res.send('join fail');
            res.render('accounts/join', { flashMessage : '이미 존재하는 id입니다.' });
        }
    });

    // User.save(function(err){
    //     res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
    // });
});
*/
/*
router.post('/join', function(req, res){
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        displayname : req.body.displayname
    });

    var join = async() => {
        return {
            existUser : await UserModel.findOne({username : User.username}),
            saveUser : await User.save()
        };
    };

    join().then(function(result){
        // console.log(result.saveUser);
        // 중복된 id로는 회원 가입 불가
        if(result.existUser){
            UserModel.deleteOne({id : result.saveUser.id}, function(err){
                res.render('accounts/join', { flashMessage : '이미 존재하는 id입니다.' });
            });
        }else{
            res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
        }
    });
});
*/
router.post('/join', async(req, res) => {
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        displayname : req.body.displayname
    });

    var existUser = await UserModel.findOne({username : User.username});

    if(existUser){
        res.render('accounts/join', { flashMessage : '이미 존재하는 id입니다.' });
    }else{
        await User.save();
        res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
    }
});

// passport
// 로그인 성공시 실행되는 done(null, user) 에서 user 객체를 전달받아 세션에 저장
passport.serializeUser(function (user, done) {
    console.log('serializeUser');
    // 두 번째 인자의 값(user)를 세션에 저장
    done(null, user);
});

// 요청이 들어올 때마다 serializeUser에서 저장된 user를 받아옴
// Deserialize는 매번 각 페이지 접근시 마다, 세션에 저장된 사용자 정보를 읽어서 HTTP request 객체에 user라는 객체를 추가로 넣어서 리턴한다.
passport.deserializeUser(function (user, done) {
    var result = user;
    result.password = "";
    console.log('deserializeUser');
    done(null, result);
});

// local 전략
passport.use(new LocalStrategy({
        usernameField: 'username', // 어떤 폼 필드로부터 아이디를 받을지 설정
        passwordField : 'password', // 어떤 폼 필드로부터 비번을 받을지 설정
        passReqToCallback : true // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
    }, 
    function (req, username, password, done) {
        UserModel.findOne({ username : username , password : passwordHash(password) }, function (err, user) {
            if (!user){
                return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
            }else{
                console.log('local strategy login success');
                return done(null, user);
            }
        });
    }
));

// passport.use(new LocalStrategy({
//         usernameField: 'username', // 어떤 폼 필드로부터 아이디와 비번을 받을지 설정
//         passwordField : 'password', // 어떤 폼 필드로부터 아이디와 비번을 받을지 설정
//         passReqToCallback : false // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
//     }, 
//     function (username, password, done) {
//         UserModel.findOne({ username : username , password : passwordHash(password) }, function (err,user) {
//             if (!user){
//                 return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
//             }else{
//                 return done(null, user );
//             }
//         });
//     }
// ));

// login
// 로그인 된 상태면 아예 다른 곳으로 접근 되도록 미들웨어 걸어주는 게 좋음
router.get('/login', function(req, res){
    res.render('accounts/login', { flashMessage : req.flash().error });
});

router.post('/login', 
    passport.authenticate('local', { 
        failureRedirect: '/accounts/login', 
        failureFlash: true
    }),
    function(req, res){
        // res.send('<script>alert("로그인 성공");location.href="/accounts/success";</script>');
        res.send('<script>alert("로그인 성공");location.href="/";</script>');
    }
);

router.get('/success', function(req, res){
    res.send(req.user);
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/accounts/login');
});

module.exports = router;