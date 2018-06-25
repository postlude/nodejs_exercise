module.exports = function(req, res, next){
    if (!req.isAuthenticated()){ 
        res.redirect('/accounts/login');
    }else{
        if(req.user.username !== 'admin1'){
            res.send('<script>alert("관라자만 접근 가능합니다.");location.href="/accounts/login";</script>');
        }else{
            next();
        }
    }
};