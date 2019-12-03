const Order = require('../models/ordersmodified.model.js');
const Product = require('../models/products.model.js');
const Admin = require('../models/admins.model.js');
const axios = require('axios');
const bcrypt = require('bcrypt');

module.exports = (app) => {
    const session = require('express-session');
    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });
    // redirect to login page
    app.get('/login', (req, res) => {
        if (session.user)
            res.redirect('/orders/pending');
        else res.render('login', {
            layout: false
        });
    });
    app.post('/addadmin', (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(400).send({
                message: "Please give both user and password"
            });
        }
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            const admin = new Admin({
                username: req.body.username,
                password: hash
            });
            admin.save()
                .then(data => {
                    res.send("created");
                    //res.redirect('/login');
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the admin."
                    });
                });
        });

    });
    //process login
    app.post('/login', (req, res) => {
        if (!req.body.username || !req.body.password) {
            res.redirect('/login');
        }
        Admin.findOne({ username: req.body.username })
            .then(admin => {
                bcrypt.compare(req.body.password, admin.password, function (err, response) {
                    if (response) {
                        req.session.user = req.body.username;
                        // session.save();
                        res.redirect('/orders/pending');
                    } else {
                        res.redirect('/login');
                    }
                });
            })
            .catch(error => {
                res.redirect('/login');
            });
    });

    // Retrieve all pending
    app.get('/products', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
            Product.find()
                .then(data => {
                    res.render('products', {
                        list: data,
                        layout: false
                    });
                })
                .catch(error => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while getting products."
                    });
                });
        }
    });
    app.get('/addproduct', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
            res.render('addproduct', {
                layout: false
            });
        }
    });
    app.post('/products', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
        if (!req.body.name || !req.body.price || !req.body.img || !req.body.display || !req.body.front_camera || !req.body.rear_camera || !req.body.battery || !req.body.storage || !req.body.ram || !req.body.processor || !req.body.os) {
            return res.status(400).send({
                message: "Please send a Valid Product"
            });
        }
        const product = new Product({
            name: req.body.name,
            stock: 0,
            price: req.body.price,
            img: req.body.img,
            display: req.body.display,
            front_camera: req.body.front_camera,
            rear_camera: req.body.rear_camera,
            battery: req.body.battery,
            os: req.body.os,
            processor: req.body.processor,
            ram: req.body.ram,
            storage: req.body.storage
        });
        product.save()
            .then(data => {
                res.send(data._id);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the order."
                });
            });
        }
    });
    app.post('/products/update', (req, res) => {
       // console.log(req.body);
       if (!req.session.user)
            res.redirect('/login');
        else {
        Product.findById(req.body.product_id)
            .then(product => {
                var sum = 0;
                var price = product.price;
                if (req.body.price)
                    price = req.body.price;
                // console.log(sum);
                Product.findByIdAndUpdate(product._id, {
                    name: product.name,
                    stock: sum,
                    price: price,
                    img: product.img,
                    display: product.display,
                    front_camera: product.front_camera,
                    rear_camera: product.rear_camera,
                    battery: product.battery,
                    os: product.os,
                    processor: product.processor,
                    ram: product.ram,
                    storage: product.storage

                }, { new: true })
                    .then(new_product => {
                        /* order delivered message */
                        res.redirect('/products');
                    })
                    .catch(error => {
                        return res.status(404).send({
                            message: "Error updating DB"
                        });
                    });
            })
            .catch(error => {
                return res.status(404).send({
                    message: "Error Finding product " + req.body.product_id
                });
            });
        }


    });
    app.get('/orders/pending', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
        Order.find({ status: { $eq: "Pending" } }).sort({createdAt : -1})
            .then(orders => {
                res.render('list', {
                    list: orders,
                    title: "Pending Orders",
                    layout: false
                });
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving accounts."
                });
            });
        }
    });
    app.get('/orders/delivered', (req, res) => {
        if (!req.session.user)
        res.redirect('/login');
    else { Order.find({ status: { $eq: "Delivered" } }).sort({createdAt : -1})
            .then(orders => {
                res.render('deliveredList', {
                    list: orders,
                    title: "Delivered Orders",
                    layout: false
                });
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving accounts."
                });
            });
        }
    });
    //Add order request
    app.post('/orders', (req, res) => {

        if (!req.body.trx_id || !req.body.details || !req.body.price) {
            return res.status(400).send({
                message: "Please send a Valid order"
            });
        }
        const order = new Order({
            trx_id: req.body.trx_id,
            details: req.body.details,
            price: req.body.price,
            status: "Pending"
        });
        order.save()
            .then(data => {
                res.send(data._id);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the order."
                });
            });
    });
    app.post('/orders/:trx_id', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
        axios.get('http://localhost:3000/transaction/' + req.params.trx_id)
            .then(response => {
                if (response.data.message) {
                    // console.log(response.data.trx_id);
                    res.render('invalidTransaction',
                        {
                            trx_id: req.params.trx_id,
                            layout: false
                        });
                }
                else {

                    res.render('validTransaction',
                        {
                            list: response.data,
                            order: req.body.order,
                            layout: false
                        });
                }
            })
            .catch(error => {
                // console.log("Mara khaise")
                console.log(error);
            });
        }
    });
    app.get('/orders/cancel/:trx_id', (req, res) => {
        if (!req.session.user)
            res.redirect('/login');
        else {
        console.log(req.params.trx_id);
        Order.findOneAndRemove({ trx_id: req.params.trx_id })
            .then(response => {
                // *******  Send an order rejection message from here.
                axios.post('http://localhost:3002/api/cancelorder', {
                    trx_id: req.params.trx_id
                })
                    .then(response => {
                        res.redirect('/orders/pending');
                    })
                    .catch(error => {
                        return res.status(404).send({
                            message: "Error Connecting E-commerce"
                        });
                    });
            })
            .catch(error => {
                // console.log("Mara khaise")
                console.log(error);
            });
        }


    });
    app.get('/orders/cancel1/:trx_id', (req, res) => {
        //console.log(req.params.trx_id);
        if (!req.session.user)
            res.redirect('/login');
        else {
        Order.findOneAndRemove({ trx_id: req.params.trx_id })
            .then(response => {
                res.redirect('/orders/pending');
            })
            .catch(error => {
                // console.log("Mara khaise")
                console.log(error);
            });
        }


    });
    app.get('/orders/confirm/:trx_id', (req, res) => {
        // console.log(req.params.trx_id);
        if (!req.session.user)
            res.redirect('/login');
        else {
        Order.findOne({ trx_id: req.params.trx_id })
            .then(order => {
                Order.findByIdAndUpdate(order._id, {
                    trx_id: order.trx_id,
                    details: order.details,
                    price: order.price,
                    status: "Delivered"
                }, { new: true })
                    .then(new_order => {
                        /* order delivered message to e-coomerce*/
                        axios.post('http://localhost:3002/api/confirmorder', {
                            trx_id: new_order.trx_id
                        })
                            .then(response => {
                                res.redirect('/orders/pending');
                            })
                            .catch(error => {
                                return res.status(404).send({
                                    message: "Error Connecting E-commerce"
                                });
                            });
                    })
                    .catch(error => {
                        return res.status(404).send({
                            message: "Error updating DB"
                        });
                    });
            })
            .catch(error => {
                return res.status(404).send({
                    message: "Error Finding trx_id"
                });
            });
        }


    });



    // API Parts
    app.get('/api/products', (req, res) => {

        Product.find()
            .then(data => {
                res.send(data);
            })
            .catch(error => {
                res.status(500).send({
                    message: err.message || "Some error occurred while getting products."
                });
            });
    });
    app.get('/api/products/:id', (req, res) => {

        Product.findById(req.params.id)
            .then(data => {
                res.send(data);
            })
            .catch(error => {
                res.status(500).send({
                    message: err.message || "Some error occurred while getting products."
                });
            });
    });

    app.post('/api/orders', (req, res) => {

        if (!req.body.trx_id || !req.body.details || !req.body.price) {
            return res.status(400).send({
                message: "Please send a Valid order"
            });
        }
        console.log(req.body);
        const order = new Order({
            trx_id: req.body.trx_id,
            details: req.body.details,
            price: req.body.price,
            status: "Pending"
        });
        order.save()
            .then(data => {
                res.send(data._id);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the order."
                });
            });
    });
}
