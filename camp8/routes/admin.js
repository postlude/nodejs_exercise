var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
// var loginRequired = require('../libs/loginRequired');
var adminRequired = require('../libs/adminRequired');
var co = require('co');
var paginate = require('express-paginate');
var CheckoutModel = require('../models/CheckoutModel');

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
/*
router.get('/products', function(req, res){
    // res.send('admin product');

    // views 폴더 하위로 적어준다.
    // 변수 명은 "" 여부 상관없음, 뒤에는 반드시 해야함
    // res.render('admin/products', {message : "hello", "camp" : "nodejs"});

    ProductsModel.find(function(err, products){
        res.render('admin/products', {products : products});
    });
});
*/

// 한 페이지에 보일 레코드 개수 : 3, 최대 개수 : 50
router.get('/products', paginate.middleware(3, 50), async (req,res) => {
    const [ results, itemCount ] = await Promise.all([
        // ProductsModel.find().limit(req.query.limit).skip(req.skip).exec(),
        ProductsModel.find().sort('-created_at').limit(req.query.limit).skip(req.skip).exec(),
        ProductsModel.count({})
    ]);
    // 전체 페이지 수
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    // 4 : 한 번에 보일 페이지 개수(1~4, 5~8..)
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);
    // console.log(pages);

    res.render('admin/products', { 
        products : results,
        pages: pages,
        pageCount : pageCount,
    });
});

// write
router.get('/products/write', adminRequired, csrfProtection, function(req, res){
    //edit에서도 같은 form을 사용하므로 빈 변수( product )를 넣어서 에러를 피해준다
    res.render( 'admin/form' , { product : "", csrfToken : req.csrfToken() }); 
});
// router.get('/products/write', function(req, res){
//     res.render('admin/form', {product : ""});
// });

router.post('/products/write', adminRequired, upload.single('thumbnail'), csrfProtection, function(req, res){
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
            // exec() 안해도 이 코드에서는 돌아간다. but 해주는게 좋음
            // react? 에서는 안해주면 에러남
            product : await ProductsModel.findOne({'id' :  req.params.id}).exec(),
            comments : await CommentsModel.find({product_id : req.params.id}).exec()
        };
    };
    getData().then(function(result){
        res.render('admin/productsDetail', { product: result.product, comments : result.comments});
    });
});

// edit
router.get('/products/edit/:id', adminRequired, csrfProtection, function(req, res){
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        res.render('admin/form', { product: product, csrfToken : req.csrfToken() });  
    });
});

router.post('/products/edit/:id', adminRequired, upload.single('thumbnail'), csrfProtection, function(req, res){
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

// summernote
router.post('/products/ajax_summernote', adminRequired, upload.single('thumbnail'), function(req, res){
    res.send('/uploads/' + req.file.filename);
});

// order
router.get('/order', function(req,res){
    CheckoutModel.find( function(err, orderList){ // 첫번째 인자는 err, 두번째는 받을 변수명
        res.render('admin/orderList', {orderList : orderList});
    });
});

router.get('/order/edit/:id', function(req,res){
    CheckoutModel.findOne({id : req.params.id}, function(err, order){
        res.render('admin/orderForm', {order : order});
    });
});

// statistics

router.get('/statistics', adminRequired, function(req, res) {
    CheckoutModel.find(function(err, orderList){
        var barData = []; // 넘겨줄 막대그래프 데이터 초기값 선언
        var pieData = []; // 원차트에 넣어줄 데이터 삽입
        orderList.forEach(function(order) {
            // 08-10 형식으로 날짜를 받아온다
            var date = new Date(order.created_at);
            var monthDay = (date.getMonth()+1) + '-' + date.getDate();

            // var test = order.getDate.month + '-' + order.getDate.day;
            // console.log(test);

            // 날짜에 해당하는 키값으로 조회
            if(monthDay in barData){
                barData[monthDay]++; // 있으면 더한다
            }else{
                barData[monthDay] = 1; // 없으면 초기값 1
            }
            
            // 결재 상태를 검색해서 조회
            if(order.status in pieData){
                pieData[order.status]++;
            }else{
                pieData[order.status] = 1;
            }
        });
        res.render('admin/statistics', {barData : barData, pieData : pieData});
    });
});

// router.get('/statistics', adminRequired, async(req,res) => {

//     // 년-월-일 을 키값으로 몇명이 결제했는지 확인한다
//     // barData._id.count 결제자수에 접근
//     var barData = await 
//         CheckoutModel.aggregate(
//             [ 
//                 { $sort : { created_at : -1 } },
//                 { 
//                     $group : {  
//                         _id : { 
//                             year: { $year: "$created_at" },
//                             month: { $month: "$created_at" }, 
//                             day: { $dayOfMonth: "$created_at" }
//                         }, 
//                         count: { $sum: 1 } 
//                     } 
//                 } 
//             ]
//         ).exec()

//     // 배송중, 배송완료, 결제완료자 수로 묶는다
//     var pieData = await CheckoutModel.aggregate([ 
//         { $group : { _id : "$status", count: { $sum: 1 } } } ]).exec()
//     res.render('admin/statistics' , { barData : barData , pieData:pieData });
    
// });
module.exports = router;