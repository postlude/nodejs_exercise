var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
// csrf 셋팅
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

// router.get('/', function (req, res) {
//     res.send('admin app');
// });

// router.get('/products', function (req, res) {
//     res.render('admin/products', { message: "test" });
// });

// products
router.get('/products', function (req, res) {
    ProductsModel.find(function (err, products) {
        res.render('admin/products',
            { products: products } // DB에서 받은 products를 products변수명으로 내보냄
        );
    });
});

// write
router.get('/products/write', csrfProtection , function(req, res){
    //edit에서도 같은 form을 사용하므로 빈 변수( product )를 넣어서 에러를 피해준다
    res.render( 'admin/form' , { product : "", csrfToken : req.csrfToken() }); 
});

router.post('/products/write', csrfProtection, function (req, res) {
    var product = new ProductsModel({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
    });

    var validationError = product.validateSync();
    if(!validationError){
        product.save(function (err) {
            res.redirect('/admin/products');
        });
    }
});

// detail
router.get('/products/detail/:id', function (req, res) {
    CommentsModel.find({'product_id' : req.params.id}, function(err, comments){
        ProductsModel.findOne({ 'id': req.params.id }, function (err, product) {
        // url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
            res.render('admin/productsDetail', { product: product, comments: comments });
        });
    });
});

// edit
router.get('/products/edit/:id', csrfProtection, function (req, res) {
    // url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne({ 'id': req.params.id }, function (err, product) {
        res.render('admin/form', { product: product, csrfToken : req.csrfToken() });
    });
});

router.post('/products/edit/:id', csrfProtection, function (req, res) {
    var query = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
    };

    // var validationError = new ProductsModel(query);
    // if(!validationError){
        ProductsModel.update({id : req.params.id}, {$set : query}, function (err) {
            res.redirect('/admin/products/detail/' + req.params.id);
        });
    // }
});

// delete
router.get('/products/delete/:id', function (req, res) {
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.remove({ 'id': req.params.id }, function (err) {
        res.redirect('/admin/products');
    });
});

// comment
router.post('/products/ajax_comment/insert', function(req, res){
    // res.json() : json 형태로 send
    // res.json(req.body);
    var comment = new CommentsModel({
        content : req.body.content,
        product_id : parseInt(req.body.product_id)
    });
    comment.save(function(err, comment){
        res.json({
            id : comment.id,
            content : comment.content,
            message : "success"
        });
    });
});

router.post('/products/ajax_comment/delete', function(req, res){
    // CommentsModel.remove({id : req.body.comment_id}, function(err){
    //     res.json({message : "success"});
    // });
    // remove()와 동일. remove()는 deprecated 됐으므로 
    CommentsModel.deleteOne({id : req.body.comment_id}, function(err){
        res.json({message : "success"});
    });
});

module.exports = router;