const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
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
// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise; 

// Connect to DB

mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");    
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});

// Home route
app.get('/', (req, res) => {
  if(!req.session.userid)
  res.redirect('/login');
else 
  {
    // console.log(req.session.name);
    res.render("home", {
      layout: false,
    });
  }    
});


require('./app/routes/app.routes.js')(app);
// listen for requests
app.listen(3002, () => {
    console.log("Server is listening on port 3002");
});
