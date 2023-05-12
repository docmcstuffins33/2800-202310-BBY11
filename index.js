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
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;



const node_session_secret = process.env.NODE_SESSION_SECRET;


var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret
  }
})

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const dishCollection = database.db(mongodb_database).collection("dishes");


app.use(express.urlencoded({ extended: false }));


app.set('view engine', 'ejs');

app.use(session({
  secret: node_session_secret,
  store: mongoStore, //default is memory store 
  saveUninitialized: false,
  resave: true
}
));

function isValidSession(req) {
  if (req.session.authenticated) {
      return true;
  }
  return false;
}

function sessionValidation(req,res,next) {
  if (isValidSession(req)) {
      next();
  }
  else {
      res.redirect('/profile?redirectedPrompt=true');
  }
}

app.get('/', (req, res) => {
  //await userCollection.insertOne({username: "test", email: "test@gmail.com", password: "pass"});
  res.render('index');
});

app.get('/dish/:id', function (req, res) {
  var dishId = req.params.id;
  var dishName = dishId // Replace this with the database dish_id

  //placeholders
  res.render('dishCard', { dishName: dishName, description: "fooood..." });
});


app.get('/dishcard', (req, res) => {
  res.render('dishCard');
});

app.get('/readMore', (req, res) => {
    res.render('readMorePage', {dish: req.query.dish});
});

app.get('/search', (req, res) => {
  res.render('search');
});

app.get('/logpage', sessionValidation, (req, res) => {
  var dishes = [];
  var history = req.session.history;
  for (let i = 0; i < history.length; i++) {
    dishes.push(history[i]);
  }


  res.render('logPage', { dishes });
});

app.get('/favourites', sessionValidation, (req, res) => {
    var dishes = [];
    var favourites = req.session.favourites;
    for (let i = 0; i < favourites.length; i++) {
      dishes.push(favourites[i]);
    }
  
  
    res.render('favourites', { dishes });
  });



app.use(express.static(__dirname + "/public"));
app.get('/signup', (req, res) => {
  res.render("signup");
})

app.post('/signupSubmit', async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  if (!username) {
    res.render("signup_missing", { error: "Username" });
    return;
  }
  if (!email) {
    res.render("signup_missing", { error: "Email" });
    return;
  }
  if (!password) {
    res.render("signup_missing", { error: "Password" });
    return;
  }

  const schema = Joi.object(
    {
      username: Joi.string().alphanum().max(20).required(),
      email: Joi.string().max(20).required(),
      password: Joi.string().max(20).required()
    });

  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/createUser");
    return;
  }

  var hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({
    username: username,
    email: email,
    password: hashedPassword,
    favourites: "",
    history: "",
  });
  console.log("Inserted user");

  // var html = "successfully created user";
  // res.send(html);

  req.session.authenticated = true;
  req.session.username = username;
  req.session.cookie.maxAge = expireTime;
  req.session.favourites = [];
  req.session.history = [];

  res.redirect('/');
  return;
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.post('/loginSubmit', async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(email);
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/login");
    return;
  }


  const result = await userCollection.find({ email: email }).project({ username: 1, email: 1, password: 1, favourites: 1, history: 1 }).toArray();

  console.log(result);
  if (result.length != 1) {
    res.render("login_error");
    return;
  }
  if (await bcrypt.compare(password, result[0].password)) {
    console.log("correct password");
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.favourites = result[0].favourites;
    var dish = await dishCollection.find({ name: "amish  tomato ketchup  for canning" }).toArray();
    req.session.history = [dish[0]];
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    req.session.user_type = result[0].user_type;
    res.redirect('/profile');
    return;
  }
  else {
    res.render("login_error");
    return;
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  // var html = `
  //   You are logged out.
  //   `;
  res.redirect('/login');
});

app.get('/profile', async (req, res) => {
  const result = await userCollection.find().project({ username: 1, email: 1, password: 1, favourites: 1}).toArray();
  if (!req.session.authenticated) {
    // res.redirect('/login');
    res.render("profile_unauthenticated", {redirectedPrompt : req.query.redirectedPrompt});
  } else {
    res.render("profile", { 
      username: req.session.username,
      users: result,
      email: req.session.email,
      password: req.session.password
    });
  }
});

app.get('/reset', (req, res) => {
  res.render("reset");
});

app.post('/changepw', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.session.username; // Assuming you have access to the current user's username

  try {
    // Retrieve the user document from the database based on the username
    const user = await userCollection.findOne({ username });

    if (!user) {
      // Handle the case if the user is not found
      return res.redirect('/');
    }

    // Compare the current password with the stored password using bcrypt
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      // Handle the case if the current password is incorrect
      return res.render('login_error');
    }

    // Update the user's password with the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await userCollection.updateOne({ username }, { $set: { password: hashedNewPassword } });

    // Redirect the user back to the account settings page with a success message
    return res.redirect('/profile?success=passwordChanged');
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error:', error);
    return res.redirect('/profile?error=serverError');
  }
});



  //right now it just makes up a user and posts it with a favourites array. when login is implemented, it will pull the users favourites,
//add onto it, then update it
app.post('/favourite', async (req,res) => {
    console.log("hi");
    var history = req.session.history;
    var dish = history.find(element => element.name == req.query.dishName);

    var favourites = req.session.favourites;
    var username = req.session.username;

    console.log(favourites);

    var removed = false;

    if(favourites == "") {
        favourites = [];
    }
    for(i = 0; i < favourites.length; i++) {
        if(dish.name == favourites[i].name) {
            favourites.splice(i, 1);
            removed = true;
        }
    }
    if(!removed){
        favourites.push(dish);
    }
    req.session.favourites = favourites;
    await userCollection.updateOne({username: username}, {$set: {favourites: favourites}});
    res.redirect(`/${req.query.page}`);
});



app.listen(port, () => {
  console.log("Node application listening on port " + port);
}); 