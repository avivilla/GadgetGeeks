const Account = require('../models/account.model.js');
const Transaction = require('../models/transaction.model.js');
const bcrypt = require('bcrypt');
// Create and Save a new account
exports.create = (req, res) => {
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
    bcrypt.hash(req.body.pin, 10, function (error, hash) {
        const account = new Account({
            ac_no: req.body.ac_no,
            pin: hash,
            balance: req.body.balance || 0
        });

        // Save account in the database
        account.save()
            .then(data => {
                res.send(data._id);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the account."
                });
            });
    });

};

// Retrieve and return all accounts from the database.
exports.findAll = (req, res) => {
    Account.find()
        .then(accounts => {
            res.send(accounts);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving accounts."
            });
        });
};
// Retrieve and return all transaction from the database.
exports.findallTransaction = (req, res) => {
    Transaction.find()
        .then(transaction => {
            res.send(transaction);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving transaction."
            });
        });
};
// Find a Transaction with a Transaction Id
exports.findTransaction = (req, res) => {
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
};

// Find a single account Balance with a ac_no
exports.findOne = (req, res) => {
    Account.findOne({ ac_no: { $eq: req.params.ac_no } })
        .then(account => {
            if (!account) {
                return res.send({
                    message: "account not found with id " + req.params.accountId
                });
            }
            // console.log(account);
            // console.log(account.balance);
            res.send({ balance: account.balance });
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
};

// Update a account balance identified by the account_id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.ac_no || !req.body.pin) {
        return res.status(400).send({
            message: "account content can not be empty"
        });
    }
    Account.findOne({ ac_no: req.body.ac_no })
        .then(account => {
            if (!account) {
                return res.status(404).send({
                    message: "account not found with id " + req.params.accountId
                });
            }
            // console.log("2");
            // Find account and update it with the request body
            bcrypt.compare(req.body.pin, account.pin, function (err, response) {
                if (response) {
                    Account.findOneAndUpdate({ ac_no: req.body.ac_no }, {
                        ac_no: req.body.ac_no,
                        pin: account.pin,
                        balance: req.body.balance - 50 || 0
                    }, { new: true })
                        .then(account => {
                            if (!account) {
                                return res.status(404).send({
                                    message: "account not found with id " + req.body.ac_no
                                });
                            }
                            res.send(account);
                        }).catch(err => {
                            if (err.kind === 'ObjectId') {
                                return res.status(404).send({
                                    message: "account not found with id " + req.body.ac_no
                                });
                            }
                            return res.status(500).send({
                                message: "Error updating account with id " + req.body.ac_no
                            });
                        });
                }
                else {
                    return res.status(404).send({
                        message: "account not found with id " + req.params.accountId
                    });
                }
            });

            // console.log(account);
            // console.log(account.balance);
            // res.send({ balance: account.balance });
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

};

// Delete a account with the specified accountId in the request
exports.delete = (req, res) => {
    Account.findByIdAndRemove(req.params.accountId)
        .then(account => {
            if (!account) {
                return res.status(404).send({
                    message: "account not found with id " + req.params.accountId
                });
            }
            res.send({ message: "account deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "account not found with id " + req.params.accountId
                });
            }
            return res.status(500).send({
                message: "Could not delete account with id " + req.params.accountId
            });
        });
};





// Transfer amount from ac_no1 to ac_no2
exports.transfer = (req, res) => {
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
            bcrypt.compare(req.body.pin,account1.pin,function(error,response){
                //console.log("2");
                if(response)
                {
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
                                                    res.send({ trx_id : data._id });
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
                else
                {
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


};