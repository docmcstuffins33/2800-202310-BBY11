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
    res.render('index');
});

// app.get('/dish/:id', function(req, res) {
//     var dishId = req.params.id;
//     var dishName = getDishNameById(dishId); // Replace this with the database dish_id
    
//     res.render('dishCard', { dishName: dishName });
//   });


app.get('/dishcard', (req,res) => {
    res.render('dishCard');
});

app.get('/readMore', (req,res) => {
    res.render('readMorePage');
});

app.get('/search', (req,res) => {
  res.render('search');
});

app.get('/logpage', (req,res) => {
    const dishes = [
        { name: 'Spaghetti Carbonara', description: 'Pasta with bacon and eggs' },
        { name: 'Chicken Tikka Masala', description: 'Indian curry with chicken' },
        { name: 'Caesar Salad', description: 'Salad with romaine lettuce and croutons' },
      ];
      
    res.render('logPage', {dishes});
  });



app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 