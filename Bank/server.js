// This is Based on the tutorial 
// https://www.callicoder.com/node-js-express-mongodb-restful-crud-api-tutorial/
// requires 
const express = require('express');
const bodyParser = require('body-parser');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
mongoose.Promise = global.Promise;
// create express app
const app = express();

// set view engines
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'home', layoutsDir: __dirname + '/views/' }));
app.set('view engine', 'hbs');
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
// parse requests of content-type - application/json
app.use(bodyParser.json())
app.use(session({
  'secret': '343ji43j4n3jn4jk3n',
  'resave' : false
}));



// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// define a simple route
app.get('/', (req, res) => {
    if(!req.session.ac_no)
       res.redirect('/login');
    else
    {
        if(req.session.ac_no==10000000)
         res.redirect('/accounts');
         else res.redirect('/accounts/'+req.session.ac_no);
    }
});
// Require accounts routes
require('./app/routes/bank.routes.js')(app);
// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});