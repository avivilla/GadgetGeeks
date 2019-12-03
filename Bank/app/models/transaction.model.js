const mongoose = require('mongoose');


const TransactionSchema = mongoose.Schema({
    ac_no1 : Number,
    ac_no2 : Number,
    amount : Number
}, {
    timestamps: true
}
);

module.exports = mongoose.model('Transaction', TransactionSchema);