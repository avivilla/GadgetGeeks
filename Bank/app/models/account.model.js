const mongoose = require('mongoose');

const AccountSchema = mongoose.Schema({
    ac_no : Number,
    pin : String,
    balance : Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', AccountSchema);
