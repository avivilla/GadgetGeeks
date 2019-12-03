const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
   name : String,
   email : String ,
   password : Number,
   ac_no : Number,
   contact : String,
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);