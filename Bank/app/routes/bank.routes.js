const Account = require('../models/account.model.js');
const Transaction = require('../models/transaction.model.js');
const bcrypt = require('bcrypt');
module.exports = (app) => {
    const accounts = require('../controllers/bank.controller.js');
    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });
    app.get('/login', (req, res) => {
        if (req.session.ac_no)
            res.redirect('/');
        else
            res.render('login', {
                layout: false
            });
    });
    app.post('/login', (req, res) => {
        // console.log(req.body);
        if (!req.body.ac_no || !req.body.pin) {
            res.redirect('/login');
        }
        else {
            var acc = parseInt(req.body.ac_no);
            //  console.log(acc);
            Account.findOne({ ac_no: acc })
                .then(ac => {
                    bcrypt.compare(req.body.pin, ac.pin, function (err, response) {
                        if (response) {
                            req.session.ac_no = ac.ac_no;
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
        }

    })
    app.get('/addaccount', (req, res) => {
        if (!req.session.ac_no)
            res.redirect('/login');
        else {
            if (req.session.ac_no == 10000000) {
                Account.find().sort({ ac_no: -1 }).limit(1)
                    .then(ac => {
                        var new_ac = parseInt(ac[0].ac_no) + 1;
                        // console.log(ac[0].ac_no);
                        res.render('addaccounts', {
                            layout: false,
                            ac_no: new_ac
                        });
                    })
                    .catch(err => {
                        res.send('genjam');
                    })

            }
            else res.redirect('/');
        }
    });
    // // Create a new account
    app.post('/accounts', (req, res) => {
        // Validate request
        if (!req.body.ac_no) {
            return res.status(400).send({
                message: "Here no ac_no"
            });
        }
        if (!req.body.pin) {
            return res.status(400).send({
                message: "pin number can not be empty"
            });
        }
        // Create a account
        // console.log("here ");
        var ac = parseInt(req.body.ac_no);
        var bal = parseInt(req.body.balance);
        bcrypt.hash(req.body.pin, 10, function (error, hash) {
            const account = new Account({
                ac_no: ac,
                pin: hash,
                balance: bal || 0
            });

            // Save account in the database
            account.save()
                .then(data => {
                    res.redirect('/');
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the account."
                    });
                });
        });

    });

    // // Retrieve all accounts
    app.get('/accounts', (req, res) => {
        if (!req.session.ac_no)
            res.redirect('/login');
        else {
            if (req.session.ac_no == 10000000) {
                Account.find().sort({ createdAt: -1 })
                    .then(accounts => {
                        res.render('accounts', {
                            list: accounts,
                            layout: false
                        });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while retrieving accounts."
                        });
                    });
            }
            else res.redirect('/');
        }

    });
    // Get all  transacations of an account
    app.get('/transactions/:ac_no', (req, res) => {
        if (!req.session.ac_no)
            res.redirect('/login');
        else {
            if (req.session.ac_no == 10000000) {
                Transaction.find( {$or: [{ac_no1 : req.params.ac_no} , {ac_no2 : req.params.ac_no}]}).sort({ createdAt: -1 })
                    .then(accounts => {
                        res.render('transactions', {
                            list: accounts,
                            layout: false
                        });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while retrieving accounts."
                        });
                    });
            }
            else res.redirect('/');
        }

    });

    // Retrieve a single account with account number
    app.get('/accounts/:ac_no', (req, res) => {
        if (!req.session.ac_no)
            res.redirect('/login');
        else{
            if (req.session.ac_no != 10000000) {
            Account.findOne({ ac_no: { $eq: req.params.ac_no } })
            .then(account => {
                if (!account) {
                    return res.send({
                        message: "account not found with id " + req.params.accountId
                    });
                }
                // console.log(account);
                // console.log(account.balance);
                res.render('userbalance',{
                    layout :false,
                    ac_no : account.ac_no,
                    balance : account.balance
                });
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "account not found with id " + req.params.accountId
                    });
                }
                return res.status(500).send({
                    message: "Error retrieving account with id " + req.params.accountId
                });
            });
        }
        else res.redirect('/');
        }
    });
    //Retreive all transaction of a single account by user
    app.get('/accounts/transactions/:ac_no',(req,res)=>{
        if (!req.session.ac_no)
        res.redirect('/login');
    else {
        if (req.session.ac_no != 10000000) {
            Transaction.find( {$or: [{ac_no1 : req.params.ac_no} , {ac_no2 : req.params.ac_no}]}).sort({ createdAt: -1 })
                .then(accounts => {
                    res.render('transactionuser', {
                        list: accounts,
                        layout: false
                    });
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving accounts."
                    });
                });
        }
        else res.redirect('/');
    }
    });

    // Retrieve a single account with accountId

    //Retrieve all transaction
    app.get('/transactions', (req, res) => {
        if (!req.session.ac_no)
            res.redirect('/login');
        else {
            if (req.session.ac_no == 10000000) {
                Transaction.find().sort({ createdAt: -1 })
                    .then(transaction => {
                        res.render('transactions', {
                            layout: false,
                            list: transaction
                        });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while retrieving transaction."
                        });
                    });
            }
            else res.redirect('/');
        }
    });
    // Update a account with accountId
    // app.put('/accounts/update', accounts.update);

    // Delete a account with accountId
    // app.delete('/accounts/:accountId', accounts.delete);
    // API PARTS
    //Make a Transfer
    app.post('/api/transfer', (req, res) => {
        // Validate Request
        // console.log(req.body);
        if (!req.body.ac_no1 || !req.body.ac_no2 || !req.body.pin || !req.body.amount) {
            return res.status(400).send({
                message: "please send an full transfer statement"
            });
        }
        // console.log(req.body.ac_no1);
        // Checking first account validity
        Account.findOne({ ac_no: req.body.ac_no1 })
            .then(account1 => {
                if (!account1) {
                    return res.status(404).send({
                        message: "Invalid sender account number " + req.body.ac_no1
                    });
                }
                //console.log("1");
                bcrypt.compare(req.body.pin, account1.pin, function (error, response) {
                    //console.log("2");
                    if (response) {
                        if (account1.balance < req.body.amount) {
                            return res.status(400).send({
                                message: "Insufficient Balance"
                            });
                        }
                        //finding 2nd account
                        Account.findOne({ ac_no: req.body.ac_no2 })
                            .then(account2 => {
                                if (!account2) {
                                    return res.status(404).send({
                                        message: "Invalid receiver account number " + req.body.ac_no2
                                    });
                                }
                                // console.log("here");
                                // cut balance from sender
                                Account.findOneAndUpdate({ ac_no: req.body.ac_no1 }, {
                                    ac_no: account1.ac_no,
                                    pin: account1.pin,
                                    balance: account1.balance - req.body.amount
                                }, { new: true })
                                    .then(account3 => {
                                        // console.log("here");
                                        Account.findOneAndUpdate({ ac_no: req.body.ac_no2 }, {
                                            ac_no: account2.ac_no,
                                            pin: account2.pin,
                                            balance: account2.balance + req.body.amount
                                        }, { new: true })
                                            .then(account4 => {

                                                const transaction = new Transaction({
                                                    ac_no1: req.body.ac_no1,
                                                    ac_no2: req.body.ac_no2,
                                                    amount: req.body.amount
                                                });

                                                // Save transaction in the database
                                                transaction.save()
                                                    .then(data => {
                                                        res.send({ trx_id: data._id });
                                                    }).catch(err => {
                                                        console.log("1");
                                                        res.status(500).send({
                                                            message: err.message || "Some error occurred while creating the account."
                                                        });
                                                    });


                                            }).catch(err => {
                                                console.log("2");
                                                return res.status(500).send({
                                                    message: "Error updating account with id " + req.body.ac_no
                                                });
                                            });


                                    }).catch(err => {
                                        console.log("3");
                                        return res.status(500).send({
                                            message: "Error updating account with id " + req.body.ac_no
                                        });
                                    });


                            }).catch(err => {
                                console.log("4");
                                return res.status(500).send({
                                    message: "Error retrieving account with account 111" + req.body.ac_no1
                                });
                            });
                    }
                    else {
                        {
                            console.log("5");
                            return res.status(400).send({
                                message: "Invalid PIN"
                            });
                        }
                    }
                });


            }).catch(err => {
                // console.log("here");
                console.log("6");
                return res.status(500).send({
                    message: err
                });
            });


    });
    app.get('/transaction/:trx_id', (req, res) => {
        //console.log("here");

        Transaction.findById(req.params.trx_id)
            .then(transaction => {
                if (!transaction) {
                    console.log(req.params.trx_id);
                    return res.send({
                        message: "1 transaction not found with id " + req.params.trx_id,
                        trx_id: req.params.trx_id
                    });
                }
                // console.log(account);
                // console.log(account.balance);
                res.send(transaction);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.send({
                        message: "2 transaction not found with id " + req.params.trx_id,
                        trx_id: req.params.trx_id
                    });
                }
                return res.status(500).send({
                    message: "3 Error retrieving transaction with id " + req.params.trx_id,
                    trx_id: req.params.trx_id
                });
            });
    });
}