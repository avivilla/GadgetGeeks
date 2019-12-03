const mongoose = require('mongoose');

const OrdersModifiedSchema = mongoose.Schema({
   trx_id : String,
   details : String ,
   price : Number,
   status : String
}, {
    timestamps: true
});

module.exports = mongoose.model('OrdersModified', OrdersModifiedSchema);