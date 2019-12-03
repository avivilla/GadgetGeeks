const mongoose = require('mongoose');

const CartsSchema = mongoose.Schema({
   product_id : String ,
   product_name : String,
   amount : Number,
   price : Number,
   user_id : String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Carts', CartsSchema);