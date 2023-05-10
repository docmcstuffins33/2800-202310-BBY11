require("./utils.js");
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
const Joi = require("joi");

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

var {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.get('/', (req,res) => {
    //await userCollection.insertOne({username: "test", email: "test@gmail.com", password: "pass"});
    res.send("Hello World!");
});

app.get('/dish/:id', function(req, res) {
    var dishId = req.params.id;
    var dishName = dishId // Replace this with the database dish_id
    
    res.render('dishCard', { dishName: dishName, description: "fooood..." });
  });


app.get('/dishcard', (req,res) => {
    res.render('dishCard');
});

app.get('/readMore', (req,res) => {
    res.render('readMorePage', {dishName: req.query.dishName});
});

app.post('/addToFavourites', async (req,res) => {
    await userCollection.insertOne({username: "test", email: "test@gmail.com", password: "pass", favourites: [{name: req.query.dishName}]});
    console.log(req.query.dishName);
    res.redirect(`/dish/${req.query.dishName}`);
});

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 