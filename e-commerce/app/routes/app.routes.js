const Order = require('../models/ordersmodified.model.js');
const User = require('../models/newusers.model.js');
const Carts = require('../models/Carts.model.js');
const Admin =require('../models/admin.model.js');
// const Admin =require('../models/admins.model.js');
const axios = require('axios');
const bcrypt = require('bcrypt');

module.exports = (app) => {
    // const session = require('express-session');
    // redirect to register page
    app.get('/register', (req, res) => {
        if (req.session.userid)
            res.redirect('/');
        else
            res.render("signup", { layout: false });
    });
    //process registration
    app.post('/register', (req, res) => {

        if (!req.body.name || !req.body.ac_no || !req.body.contact || !req.body.password || !req.body.email) {
            res.redirect('/register');
        }
        bcrypt.hash(req.body.password, 10, function (error, hash) {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                ac_no: req.body.ac_no,
                contact: req.body.contact,
            });
            user.save()
                .then(data => {
                    // res.send("created");
                    res.redirect('/login');
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the user"
                    });
                });
        });

    });
    //redirect to login page 
    app.get('/login', (req, res) => {
        if (req.session.userid)
            res.redirect('/');
        else
            res.render("login", { layout: false });
    });
    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });
    //process login
    app.post('/login', (req, res) => {
        if (!req.body.password || !req.body.email) {
            res.redirect('/login');
        }
        User.findOne({ email: req.body.email })
            .then(user => {
                bcrypt.compare(req.body.password, user.password, function (err, response) {
                    if (response) {
                        req.session.id = user._id;
                        req.session.userid = user._id;
                        req.session.ac_no = user.ac_no;
                        req.session.name = user.name;
                        req.session.save();
                        res.redirect('/');
                    } else {
                        res.redirect('/login');
                    }
                });
            })
            .catch(error => {
                res.redirect('/login');
            });


    });
    //get all products and redirect to 
    app.get('/store', (req, res) => {
        if (!req.session.userid)
            res.redirect('/login');
        else {
            axios.get('http://localhost:3001/api/products')
            .then(response => {
                // console.log(response.data);
                // res.send(response.data);
                res.render('store', {
                    layout: false,
                    list: response.data
                });
            })
            .catch(error => {
                // console.log("Mara khaise")
                console.log(error);
            });
        }
    });
    app.get('/store/:id', (req, res) => {
        if (!req.session.userid)
            res.redirect('/login');
        else {
        axios.get('http://localhost:3001/api/products/' + req.params.id)
            .then(response => {
                // console.log(response.data);
                // res.send(response.data);
                res.render('product', {
                    layout: false,
                    product: response.data
                });
            })
            .catch(error => {
                // console.log("Mara khaise")
                console.log(error);
            });
        }
    });
    // Add to Cart
    app.post('/addtocart', (req, res) => {
        //res.send(req.body);
        if (!req.session.userid)
            res.redirect('/login');
        else {
            if (!req.body._id || !req.body.name || !req.body.price) {
                res.redirect('/products');
            }
            //console.log(req.session.name);
            const cart = new Carts({
                product_id: req.body._id,
                product_name: req.body.name,
                amount: req.body.amount || 1,
                price: req.body.price,
                user_id: req.session.userid
            });
            cart.save()
                .then(data => {
                    // res.send(data);
                    res.redirect('/cart');
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the user"
                    });
                });
        }
    });
    // get view all the carts
    app.get('/cart', (req, res) => {
        //console.log(req.session.userid);
        if (!req.session.userid)
            res.redirect('/login');
        else {
        Carts.find({ user_id: req.session.userid }).sort({ createdAt: -1 })
            .then(cart => {
                var sum = 0;
                // var details = ""; 
                for (var i = 0; i < cart.length; i++) {
                    sum = sum + (cart[i].amount * cart[i].price);
                    // details =details +" "+ cart[i].amount.toString() + " " +cart[i].product_name + "</li>";
                }
                res.render('cart', {
                    layout: false,
                    list: cart,
                    sum: sum
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: err.message
                });
            });
        }
    });
    app.get('/placeorder', (req, res) => {
        if (!req.session.userid)
        res.redirect('/login');
    else {
        Carts.find({ user_id: req.session.userid }).sort({ createdAt: -1 })
            .then(cart => {
                //console.log(cart);
                var sum = 0;
                var details = "";
                for (var i = 0; i < cart.length; i++) {
                    sum = sum + (cart[i].amount * cart[i].price);
                    details = details + cart[i].product_name + " (" + cart[i].amount.toString() + "  PCS , BDT " + (cart[i].amount * cart[i].price).toString() + "), ";
                }
                //console.log(sum);
                res.render('placeorder', {
                    layout: false,
                    total: sum,
                    products: details
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: error.message
                });
            });
        }

    });
    app.post('/placeorder', (req, res) => {
        var price1 = Number(req.body.price);
        // console.log(price);
        // res.send({price} );
        // console.log(req.session);
        axios.post('http://localhost:3000/api/transfer', {
            ac_no1: req.session.ac_no,
            ac_no2: 10000004,
            pin: req.body.pin,
            amount: price1
        }).then(response1 => {
            //  console.log("2");
            var amo = (price1 / 10 * 9);
            // console.log(amo);
            axios.post('http://localhost:3000/api/transfer', {
                ac_no1: 10000004,
                ac_no2: 10000002,
                pin: "234567",
                amount: amo
            }).then(response2 => {
                const order = new Order({
                    details: req.body.details,
                    user_id: req.session.userid,
                    price: price1,
                    address: req.body.address,
                    trx1: response1.data.trx_id,
                    trx2: response2.data.trx_id,
                    status: "Pending"
                });
                // console.log(response2.data);
                order.save()
                    .then(response3 => {
                        axios.post('http://localhost:3001/api/orders', {
                            trx_id: response2.data.trx_id,
                            details: req.body.details,
                            price: price1,
                        }).then(response4 => {

                            Carts.deleteMany({ user_id: req.session.userid })
                                .then(response5 => {
                                    res.redirect('/orders');
                                }).catch(error5 => {
                                    // console.log("4445");
                                    res.redirect('/placeorder');
                                });


                        }).catch(error4 => {
                            //    console.log("444");
                            res.redirect('/placeorder');
                        });
                    })
                    .catch(error3 => {
                        // console.log("132413");
                        res.redirect('/placeorder');
                    });
            }).catch(error2 => {
                // console.log("097389");
                res.redirect('/placeorder');
            });

        }).catch(error1 => {
            //console.log("3");
            res.redirect('/placeorder');
        });
    });
    app.post('/removecart', (req, res) => {
        Carts.findByIdAndRemove(req.body.id)
            .then(cart => {
                res.redirect('/cart');
            })
            .catch(error => {
                res.status(500).send({
                    message: error.message
                });
            });
    });
    app.get('/orders', (req, res) => {
        // console.log(req.session);
        if (!req.session.userid)
            res.redirect('/login');
        else {
        Order.find({ user_id: req.session.userid }).sort({ createdAt: -1 })
            .then(response => {
                res.render('pendingorders', {
                    layout: false,
                    list: response
                });
            }).catch(error => {
                res.send("error");
            });
        }
    });
    app.get('/about', (req,res)=>{
        if (!req.session.userid)
            res.redirect('/login');
        else {
            res.render('about',{
                layout:false
            });
        }
    });
    // API PARTS
    app.post('/api/confirmorder', (req, res) => {
        // console.log(req.body.trx_id);
        Order.findOne({ trx2: req.body.trx_id })
            .then(order => {
                //console.log(order._id + "  " + order.user_id + " " + order.address);
                Order.findByIdAndUpdate(order._id, {
                    details: order.details,
                    user_id: order.user_id,
                    price: order.price,
                    address: order.address,
                    trx1: order.trx1,
                    trx2: order.trx2,
                    status: "Delivered"
                }, { new: true })
                    .then(response => {
                        //  console.log(response._id + "  " + response.user_id + " " + response.address);
                        res.send({
                            message: "ok"
                        });
                    })
                    .catch(error2 => {
                        res.status(500).send({
                            message: error.message
                        });
                    });
            })
            .catch(error1 => {
                res.status(500).send({
                    message: error.message
                });
            });
    });

    app.post('/api/cancelorder', (req, res) => {
        Order.findOne({ trx2: req.body.trx_id })
            .then(order => {
                Order.findByIdAndUpdate(order._id, {
                    details: order.details,
                    user_id: order.user_id,
                    price: order.price,
                    address: order.address,
                    trx1: order.trx1,
                    trx2: order.trx2,
                    status: "Cancelled"
                }, { new: true })
                    .then(response => {
                        res.send({
                            message: "ok"
                        });
                    })
                    .catch(error2 => {
                        res.status(500).send({
                            message: error.message
                        });
                    });
            })
            .catch(error1 => {
                res.status(500).send({
                    message: error.message
                });
            });
    });
// Admin Site

app.get('/admin', (req,res) =>{
    if (req.session.admin)
        {
            Order.find().sort({createdAt : -1})
            .then(response =>{
               res.render('adminhome',{
                   layout :false,
                   list : response
               })
            })
            .catch(error=>{

            })
        }
    else
        res.redirect('/admin/login');
});
app.get('/admin/login', (req, res) => {
    if (req.session.admin)
        res.redirect('/admin');
    else
        res.render("adminlogin", { layout: false });
});
app.post('/admin/login',(req,res)=>{
    console.log(req.body);
    if (!req.body.password || !req.body.username) {
        res.redirect('/admin/login');
    }
    Admin.findOne({ username : req.body.username })
        .then(admin => {
            bcrypt.compare(req.body.password, admin.password, function (err, response) {
                if (response) {
                    console.log(req.body.username);
                    req.session.admin = admin.username;
                    req.session.save();
                    res.redirect('/admin');
                } else {
                    res.redirect('/admin/login');
                }
            });
        })
        .catch(error => {
            res.redirect('/admin/login');
        });
});
app.post('/admin',(req,res)=>{
    // Admin.find()
    // .then(response =>{
    //     res.send(response);
    // })
    // .catch(error=>{
    //     res.send("error");
    // });
    if (!req.body.username  || !req.body.password ) {
        res.send('1');
    }
    bcrypt.hash(req.body.password, 10, function (error, hash) {
        const admin = new Admin({
            username: req.body.username,
            password: hash,
        });
        admin.save()
            .then(data => {
                res.send(data);
                // res.redirect('/login');
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the user"
                });
            });
    });
});

}
