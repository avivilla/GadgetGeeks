const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
   trx_id : String,
   product_id : String ,
   amount : Number,
   price : Number,
   status : String,
   user_id : String,
   address : String
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);