module.exports = function(req, res, next){
    if(req.isAuthenticated()){
        console.log('already login');
        res.redirect('/');
    }else{
        return next();
    }
}