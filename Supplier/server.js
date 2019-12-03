const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
// create express app
const app = express();
// set view engines
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/' }));
app.set('view engine', 'hbs');
// parse requests of content-type - application/x-www-form-urlencoded
app.use(session({
  'secret': '343ji43j4n3jn4jk3n'
}));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
// parse requests of content-type - application/json
app.use(bodyParser.json())

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
// define a simple route

app.get('/', (req, res) => {
  if(!req.session.user)
      res.redirect('/login');
  else res.redirect('/orders/pending');
    
});
require('./app/routes/app.routes.js')(app);
// listen for requests
app.listen(3001, () => {
    console.log("Server is listening on port 3001");
});
