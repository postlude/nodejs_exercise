var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    // 총 결제금액
    var totalAmount = 0;
    // 장바구니 리스트
    var cartList = {};

    // 쿠키가 있는지 확인해서 뷰로 넘겨준다
    if(typeof(req.cookies.cartList) !== 'undefined'){
        // 장바구니 리스트
        var cartList = JSON.parse(unescape(req.cookies.cartList));

        // 장바구니 리스트
        for(var key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
    }
    res.render('cart/index', {cartList : cartList, totalAmount : totalAmount});
});

module.exports = router;