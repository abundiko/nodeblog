const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const indexRouter = require('./routes/routes');

app.set('view engine', 'ejs');/// set view engine
app.use("", indexRouter);
app.use(express.static(__dirname + '/public'));/// to render static files
app.use(express.static('assets'));/// to render static files
app.use(express.urlencoded({ extended: true }));/// to access form data
app.use(express.json());/// if i work with json




app.listen(process.env.PORT);



