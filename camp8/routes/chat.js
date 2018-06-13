var express = require('express');
var router = express.Router();

// loginRequired mw 걸어줘도 됨
router.get('/', function(req,res){
    // res.render('chat/index');
    if(!req.isAuthenticated()){
        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login";</script>');
    }else{
        res.render('chat/index');
    }
});

module.exports = router;