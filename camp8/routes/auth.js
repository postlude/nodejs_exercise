var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(user, done){
    done(null, user);
});

passport.use(new FacebookStrategy({
        // https://developer.facebook.com에서 appId, secretId 발급
        clientID : "2065577683682157",
        clientSecret : "7feb6db1b3fc0312f3db318d2de2fbef",
        callbackURL : "https://localhost:3000/auth/facebook/callback",
        profileFields : ['id', 'displayName', 'photos', 'email'] // 받고 싶은 필드 나열
    },
    function(accessToken, refreshToken, profile, done) {
        // 아래 하나씩 찍어보면서 데이터를 참고해주세요.
        // console.log(profile);
        // console.log('displayname : ' + profile.displayName);
        // console.log(profile.emails[0].value);
        // console.log(profile._raw);
        // console.log(profile._json);
        UserModel.findOne({username : "fb_" + profile.id}, function(err, user){
            if(!user){ // 없으면 회원가입 후 로그인 성공페이지 이동
                var regData = { // db에 등록 및 세션에 등록될 데이터
                    username : "fb_" + profile.id,
                    password : "facebook_login", // 이렇게 두면 안되고 모델에 타입을 하나 추가하는 식으로 해야 됨
                    // 지금과 같은 식이면 아이디에 페북 아이디, 비번에 facebook_login 치면 로그인 됨
                    displayname : profile.displayName
                };
                var User = new UserModel(regData);
                User.save(function(err){ // db 저장
                    done(null, regData); // 세션 등록
                });
            }else{ // 있으면 db에서 가져와서 세션등록
                done(null, user);
            }
        });
    }
));

// http://localhost:3000/auth/facebook 접근시 facebook으로 넘길 url 작성해줌
router.get('/facebook', passport.authenticate('facebook', {scope : 'email'}));

// 인증후 페이스북에서 이 주소로 리턴해줌. 상단에 적은 callbackURL과 일치
router.get('/facebook/callback',
    passport.authenticate('facebook',
        {
            // successRedirect : '/auth/facebook/success',
            successRedirect : '/',
            failureRedirect : '/auth/facebook/fail'
        }
    )
);

// 로그인 성공시 이동할 주소
router.get('/facebook/success', function(req,res){
    res.send(req.user);
});

router.get('/facebook/fail', function(req,res){
    res.send('facebook login fail');
});


// github login

module.exports = router;