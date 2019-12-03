const mongoose = require('mongoose');

const NewOrderSchema = mongoose.Schema({
   trx_id1 : String,//trx id  from user to bank
   trx_id2 : String,//trx id from bank to supllier
   product_id : String ,
   product_name : String,
   amount : Number,
   price : Number,
   status : String,
   user_id : String,
   address : String
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', NewOrderSchema);