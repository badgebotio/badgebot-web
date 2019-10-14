const express = require('express');
const app = express();

const path = require('path');
const morgan = require('morgan');
const winston = require('./config/winston');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//set up our express application
app.use(morgan('combined', { stream: winston.stream })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(function (req, res, next) {
  res.locals = {
      siteLogo: process.env.SITE_LOGO
   };
   next();
});

app.set('views', [path.join(__dirname, 'app/views')]);
app.set('view engine', 'ejs');
require('./routes.js')(app);

app.listen(3000, () => console.log('BadgeBot web listening on port 3000!'));

app.use(function (req, res, next) {
    res.status(404);

    return res.render('404', {
        title: "404 - Page Not Found",
        description: "404 - Page Not Found"
    });
});


app.use(function(error, req, res, next) {
  //res.send('500: Internal Server Error', 500);
  //console.log("HHHEEEY");
  //logger.error(error);
    return res.render('500', {
        title: "Something Went Wrong",
        description: "500 - Something went wrong"
    });
});
