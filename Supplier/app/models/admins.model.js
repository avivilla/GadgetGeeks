const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
   username : String,
   password : String
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);