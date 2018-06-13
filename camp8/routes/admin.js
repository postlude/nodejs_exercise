var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
var loginRequired = require('../libs/loginRequired');
var co = require('co');

// csrf 셋팅
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

//이미지 저장되는 위치 설정
var path = require('path');
var uploadDir = path.join(__dirname, '../uploads'); // 루트의 uploads위치에 저장한다.
var fs = require('fs');

// multer 셋팅
var multer  = require('multer');
// 업로드할 디렉토리 설정
var storage = multer.diskStorage({
    destination : function (req, file, callback) { //이미지가 저장되는 도착지 지정
        callback(null, uploadDir);
    },
    filename : function (req, file, callback) { // products-날짜.jpg(png) 저장
        callback(null, 'products-' + Date.now() + '.'+ file.mimetype.split('/')[1] );
    }
});
var upload = multer({ storage: storage });

// middleware
// function testMiddleWare(req, res, next){
//     console.log("middleware")
//     next();
// }
// function loginRequired(req, res, next){
    // if(로그인체크){
    //     next();
    // }else{
    //     res.redirect('/accounts/login');
    // }
// }

router.get('/', function(req, res){
    res.send('admin app1111');
});

// router.get('/products', loginRequired, testMiddleWare, function(req, res){
router.get('/products', function(req, res){
    // res.send('admin product');

    // views 폴더 하위로 적어준다.
    // 변수 명은 "" 여부 상관없음, 뒤에는 반드시 해야함
    // res.render('admin/products', {message : "hello", "camp" : "nodejs"});

    ProductsModel.find(function(err, products){
        res.render('admin/products', {products : products});
    });
});

// write
router.get('/products/write', loginRequired, csrfProtection, function(req, res){
    //edit에서도 같은 form을 사용하므로 빈 변수( product )를 넣어서 에러를 피해준다
    res.render( 'admin/form' , { product : "", csrfToken : req.csrfToken() }); 
});
// router.get('/products/write', function(req, res){
//     res.render('admin/form', {product : ""});
// });

router.post('/products/write', loginRequired, upload.single('thumbnail'), csrfProtection, function(req, res){
    var product = new ProductsModel({
        name : req.body.name,
        thumbnail : (req.file) ? req.file.filename : "",
        price : req.body.price,
        description : req.body.description,
        username : req.user.username
    });

    // var validationError = product.validateSync();
    // if(validationError){
    //     res.send(validationError);
    // }else{
    //     product.save(function(err){
    //         res.redirect('/admin/products');
    //     });
    // }
    if(!product.validateSync()){
        product.save(function(err){
            res.redirect('/admin/products');
        });
    }
});

// detail
router.get('/products/detail/:id', function(req, res){
    /*
    // url에서 변수 값을 받아올 땐 req.params.id 로 받아온다.
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        // CommentsModel이 ProductsModel 밖에 있으면
        // nodejs는 비동기 식이라 값을 받아오기 전에 render로 넘어가는 케이스가 발생할 수도 있음
        // 따라서 callback function 안에 들어가는 식으로 작성해야 함
        CommentsModel.find({product_id : req.params.id}, function(err, comments){
            res.render('admin/productsDetail', { product: product, comments : comments});
        });
    });
    */
   /*
    var getData = co(function* (){
        // var product = yield ProductsModel.findOne({'id' :  req.params.id}).exec();
        // var comments = yield CommentsModel.find({product_id : req.params.id}).exec();
        // console.log(product);
        return {
            // product : product,
            // comments : comments
            product : yield ProductsModel.findOne({'id' :  req.params.id}).exec(),
            comments : yield CommentsModel.find({product_id : req.params.id}).exec()
        };
    });
    getData.then(function(result){
        // res.send(result);
        res.render('admin/productsDetail', { product: result.product, comments : result.comments});
    });
    */
   var getData = async () => {
        return {
            product : await ProductsModel.findOne({'id' :  req.params.id}).exec(),
            comments : await CommentsModel.find({product_id : req.params.id}).exec()
        };
    };
    getData().then(function(result){
        res.render('admin/productsDetail', { product: result.product, comments : result.comments});
    });
});

// edit
router.get('/products/edit/:id', loginRequired, csrfProtection, function(req, res){
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        res.render('admin/form', { product: product, csrfToken : req.csrfToken() });  
    });
});

router.post('/products/edit/:id', loginRequired, upload.single('thumbnail'), csrfProtection, function(req, res){
    //그 전에 지정되어있는 파일명을 받아온다
    ProductsModel.findOne( {id : req.params.id} , function(err, product){
        var query = {
            name : req.body.name,
            thumbnail : (req.file) ? req.file.filename : product.thumbnail, // 새로운 파일을 업로드 했으면 새 파일명, 아니면 위에서 받아온 이전 파일명 그대로
            price : req.body.price,
            description : req.body.description
        };

        // update의 첫번째 인자는 조건, 두번째 인자는 바꿀 값
        ProductsModel.update({id : req.params.id}, {$set : query}, function(err){
            // 수정 후 상세페이지로
            res.redirect('/admin/products/detail/' + req.params.id);
        });
    });
});

// delete
router.get('/products/delete/:id', function(req, res){
    ProductsModel.remove({id : req.params.id}, function(err){
        if(req.file){  // 요청 중에 파일이 존재하면 이전이미지 지운다.
            fs.unlinkSync(uploadDir + '/' + product.thumbnail );
        }
        res.redirect('/admin/products');
    });
});

// comment
router.post('/products/ajax_comment/insert', function(req, res){
    // res.json({
    //     message : "hello",
    //     lecture : "nodejs"
    // });

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
    CommentsModel.remove({id : req.body.comment_id}, function(err){
        res.json({message : "success"});
    });
});

module.exports = router;