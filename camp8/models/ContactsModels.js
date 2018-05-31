var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var ContactsSchema = new Schema({
    title : String,
    writer : String,
    content : String,
    created_at : {
        type : Date,
        default : Date.now()
    }
});

ContactsSchema.virtual('getDate').get(function(){
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth() + 1,
        day : date.getDate()
    };
});

ContactsSchema.plugin(autoIncrement.plugin, 
    {model : 'contacts', field : 'id', startAt : 1}
);
module.exports = mongoose.model('contacts', ContactsSchema);