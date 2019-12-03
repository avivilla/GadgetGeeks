const mongoose = require('mongoose');
const OrdersModifiedSchema = mongoose.Schema({
    details : String,
    user_id : String,
    price : Number,
    address : String,
    trx1 : String,
    trx2 : String,
    status : String
}, {
    timestamps: true
}
);

module.exports = mongoose.model('OrdersModified', OrdersModifiedSchema);