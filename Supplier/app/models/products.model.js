const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name  : String,
    stock : Number,
    price : Number,
    img   : String,
    display : String,
    front_camera : String,
    rear_camera :String,
    battery : String,
    os : String,
    processor : String,
    ram : String ,
    storage : String
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);