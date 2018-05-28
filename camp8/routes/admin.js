var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');

router.get('/', function(req, res){
    res.send('admin app1111');
});

router.get('/products', function(req, res){
    // res.send('admin product');

    // views 폴더 하위로 적어준다.
    // 변수 명은 "" 여부 상관없음, 뒤에는 반드시 해야함
    // res.render('admin/products', {message : "hello", "camp" : "nodejs"});

    ProductsModel.find(function(err, products){
        res.render('admin/products', {products : products});
    });
});

router.get('/products/write', function(req, res){
    res.render('admin/form', {product : ""});
});

router.post('/products/write', function(req, res){
    var product = new ProductsModel({
        name : req.body.name,
        price : req.body.price,
        description : req.body.description
    });
    product.save(function(err){
        res.redirect('/admin/products');
    });
});

router.get('/products/detail/:id', function(req, res){
    // url에서 변수 값을 받아올 땐 req.params.id 로 받아온다.
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        res.render('admin/productsDetail', { product: product });  
    });
});

router.get('/products/edit/:id', function(req, res){
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        res.render('admin/form', { product: product });  
    });
});

router.post('/products/edit/:id', function(req, res){
    var query = {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description
    };

    // update의 첫번째 인자는 조건, 두번째 인자는 바꿀 값
    ProductsModel.update({id : req.params.id}, {$set : query}, function(err){
        // 수정 후 상세페이지로
        res.redirect('/admin/products/detail/' + req.params.id);
    });
});

router.get('/products/delete/:id', function(req, res){
    ProductsModel.remove({id : req.params.id}, function(err){
        res.redirect('/admin/products');
    });
});

module.exports = router;