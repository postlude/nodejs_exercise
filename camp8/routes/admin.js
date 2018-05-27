var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.send('admin app1111');
});

router.get('/products', function(req, res){
    res.send('admin product');
});

module.exports = router;