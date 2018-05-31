var express = require('express');
var router = express.Router();
var ContactsModel = require('../models/ContactsModels');

// router.get('/', function(req, res){
//     res.send('contacts app');
// });

router.get('/', function(req, res){
    ContactsModel.find(function(err, contacts){
        res.render('../views/contacts/list.ejs', {contacts : contacts});
    });
});

// write
router.get('/write', function(req, res){
    res.render('../views/contacts/form.ejs', {contact : ""});
});

router.post('/write', function(req, res){
    var contacts = new ContactsModel({
        title : req.body.title,
        writer : req.body.writer,
        content : req.body.writer
    });
    contacts.save(function(err){
        res.redirect('/contacts');
    });
});

// detail
router.get('/detail/:id', function(req, res){
    ContactsModel.findOne({id : req.params.id}, function(err, contact){
        res.render('../views/contacts/contactsDetail.ejs', {contact : contact});
    });
});

// edit
router.get('/edit/:id', function(req, res){
    ContactsModel.findOne({id : req.params.id}, function(err, contact){
        res.render('../views/contacts/form.ejs', {contact : contact});
    });
});

router.post('/edit/:id', function(req, res){
    var query = {
        title : req.body.title,
        writer : req.body.writer,
        content : req.body.content
    };

    ContactsModel.update({id : req.params.id}, {$set : query}, function(err){
        res.redirect('/contacts/detail/' + req.params.id);
    });
});

// delete
router.get('/delete/:id', function(req, res){
    ContactsModel.remove({id : req.params.id}, function(err){
        res.redirect('/contacts');
    });
});

module.exports = router;