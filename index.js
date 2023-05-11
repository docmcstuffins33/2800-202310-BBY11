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

app.get('/dish/:id', function(req, res) {
    var dishId = req.params.id;
    var dishName = dishId // Replace this with the database dish_id
    
    //placeholders
    res.render('dishCard', { dishName: dishName, description: "fooood..." });
  });


app.get('/dishcard', (req,res) => {
    res.render('dishCard');
});

app.get('/readMore', (req,res) => {
    res.render('readMorePage', {dishName: req.query.dishName});
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
  
  //right now it just makes up a user and posts it with a favourites array. when login is implemented, it will pull the users favourites,
//add onto it, then update it
app.post('/addToFavourites', async (req,res) => {
    var username = "test"
    const result = await userCollection.find({username: username}).project({favourites: 1}).toArray();
    var favourites = result[0].favourites;
    favourites.push({name: req.query.dishName})
    await userCollection.updateOne({username: username}, {$set: {favourites: favourites}});
    console.log(req.query.dishName);
    res.redirect(`/logpage`);
});

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 