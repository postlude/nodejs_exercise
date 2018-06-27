var express = require('express');
var router = express.Router();
var CheckoutModel = require('../models/CheckoutModel');
var request = require('request');
var cheerio = require('cheerio');
var removeEmpty = require('../libs/removeEmpty');

const { Iamporter, IamporterError } = require('iamporter');
const iamporter = new Iamporter({
    apiKey: '3719185323074296',
    secret: 'rqJfPXw9KE4RsBcHVcsptp6js2mklCdN3W3SUz2Ee7vHIIpDVS3oh9HKc44xHhkKenD9XGNbNjSv1i9W'
});

router.get('/', function(req, res) {
    var totalAmount = 0; // 총결제금액
    var cartList = {}; // 장바구니 리스트

    // 쿠키가 있는지 확인해서 뷰로 넘겨준다
    if( typeof(req.cookies.cartList) !== 'undefined'){
        // console.log(req.cookies.cartList);
        // console.log(unescape(req.cookies.cartList));
        // console.log(decodeURIComponent(req.cookies.cartList));

        // 장바구니데이터
        var cartList = JSON.parse(unescape(req.cookies.cartList));

        // 총가격을 더해서 전달해준다.
        for(let key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
    }
    res.render('checkout/index', { cartList : cartList , totalAmount : totalAmount } );
});

// complete
router.get('/complete', async(req, res) => {
    var payData = await iamporter.findByImpUid(req.query.imp_uid);
    // console.log(payData);

    var checkout = new CheckoutModel({
        imp_uid : payData.data.imp_uid,
        merchant_uid : payData.data.merchant_uid,
        paid_amount : payData.data.amount,
        apply_num : payData.data.apply_num,

        buyer_email : payData.data.buyer_email,
        buyer_name : payData.data.buyer_name,
        buyer_tel : payData.data.buyer_tel,
        buyer_addr : payData.data.buyer_addr,
        buyer_postcode : payData.data.buyer_postcode,

        status : "결제완료"
    });
    await checkout.save();
    res.redirect('/checkout/success');
});

router.post('/complete', (req,res) => {
    var checkout = new CheckoutModel({
        imp_uid : req.body.imp_uid,
        merchant_uid : req.body.merchant_uid,
        paid_amount : req.body.paid_amount,
        apply_num : req.body.apply_num,
        
        buyer_email : req.body.buyer_email,
        buyer_name : req.body.buyer_name,
        buyer_tel : req.body.buyer_tel,
        buyer_addr : req.body.buyer_addr,
        buyer_postcode : req.body.buyer_postcode,

        status : req.body.status,
    });

    checkout.save(function(err){
        res.json({message:"success"});
    });
});

router.post('/mobile_complete', (req,res)=>{
    var checkout = new CheckoutModel({
        imp_uid : req.body.imp_uid,
        merchant_uid : req.body.merchant_uid,
        paid_amount : req.body.paid_amount,
        apply_num : req.body.apply_num,
        
        buyer_email : req.body.buyer_email,
        buyer_name : req.body.buyer_name,
        buyer_tel : req.body.buyer_tel,
        buyer_addr : req.body.buyer_addr,
        buyer_postcode : req.body.buyer_postcode,

        status : req.body.status,
    });

    checkout.save(function(err){
        res.json({message:"success"});
    });
});

router.get('/success', function(req, res){
    res.render('checkout/success');
});

router.get('/nomember', function(req, res){
    res.render('checkout/nomember');
});

router.get('/nomember/search', function(req, res){
    CheckoutModel.find({buyer_email : req.query.email}, function(err, checkoutList){
        res.render('checkout/search', {checkoutList : checkoutList});
    });
});

// shipping
router.get('/shipping/:invc_no', (req,res) => {
    // 대한통운의 현재 배송위치 크롤링 주소
    var url = "https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=" + req.params.invc_no;
    var result = []; // 최종 보내는 데이터
    request(url, (error, response, body) => {  
        // decodeEntities: false : 한글 변환
        var $ = cheerio.load(body, { decodeEntities: false });

        var tdElements = $(".board_area").find("table.mb15 tbody tr td"); // td의 데이터를 전부 긁어온다
        // console.log(tdElements[0].children[0].data);
        // console.log(removeEmpty(tdElements[0].children[0].data));
        // console.log(tdElements[1].children[0].data);
        // console.log(tdElements[3].children[1].children[0].data);

        // 한 row가 4개의 칼럼으로 이루어져 있으므로
        // 4로 나눠서 각각의 줄을 저장한 한줄을 만든다
        for(var i=0; i<tdElements.length; i++){
            if(i%4 === 0){
                // 임시로 한줄을 담을 변수
                var temp = {};
                temp["step"] = removeEmpty(tdElements[i].children[0].data);
            }else if(i%4 === 1){
                temp["date"] = tdElements[i].children[0].data;
            }else if(i%4 === 2){
                // 여기는 children을 1,2한게 배송상태와 두번째줄의 경우 담당자의 이름 br로 나뉘어져있다.
                // 0번째는 배송상태, 1은 br, 2는 담당자 이름
                temp["status"] = tdElements[i].children[0].data;
                if(tdElements[i].children.length > 1){
                    temp["status"] += tdElements[i].children[2].data;
                }
            }else if(i%4 === 3){
                temp["location"] = tdElements[i].children[1].children[0].data;
                // 한줄을 다 넣으면 result의 한줄을 푸시한다
                result.push(temp);
                // 임시변수 초기화 
                temp = {};
            }
        }
        res.render('checkout/shipping', {result : result});
    });
});

module.exports = router;