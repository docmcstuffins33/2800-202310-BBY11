require("./utils.js");
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
const Joi = require("joi");
const { time } = require("console");

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

const numDishes = 231637;

var meow = false;

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
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(session({
  secret: node_session_secret,
  store: mongoStore, //default is memory store 
  saveUninitialized: false,
  resave: true
}
));

function sessionValidation(req,res,next) {
  if(!req.session.authenticated) {
    req.session.authenticated = true;
    req.session.loggedIn = false;
    req.session.meow = false;
    req.session.history = [];
    req.session.cookie.maxAge = expireTime;
  }
  next();
}

function isLoggedIn(req) {
  return (req.session.loggedIn);
}

function loginValidation(req,res,next) {
  if (isLoggedIn(req)) {
      next();
  }
  else {
      res.redirect('/profile?redirectedPrompt=true');
  }
}

app.use('*', sessionValidation);

app.get('/', (req, res) => {
  //await userCollection.insertOne({username: "test", email: "test@gmail.com", password: "pass"});
  res.render('search');
});

app.get('/dish/:id', function (req, res) {
  var dishName = req.params.id;
  dishCollection.findOne({name: dishName}) // Fetch a single dish from the database
  .then(dish => {
    req.session.history.push(dish);
    userCollection.updateOne({username: username}, {$set: {history: req.session.history}});
    res.json(dish); // Send the dish as a JSON response
  })
  .catch(error => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });

});

// Endpoint to handle the dish request
app.get('/dish', async (req, res) => {
  var dishId = Math.floor(Math.random() * numDishes);
  dishCollection.findOne({'id': dishId}) // Fetch a single dish from the database
    .then(dish => {
      console.log(dish);
      req.session.history.push(dish);
      if(req.session.loggedIn) {
        userCollection.updateOne({username: req.session.username}, {$set: {history: req.session.history}});
      }
      res.json(dish); // Send the dish as a JSON response
      
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/easterEggCheck', async (req,res) => {
  req.session.save();
  console.log(req.session.meow)
  var cat = req.session.meow;
  const response = {cat: cat};
  res.json(response);
})

app.get('/meow', async (req,res) => {
  if(req.session.meow) {
    req.session.meow = false;
    req.session.save();
  } else {
    req.session.meow = true;
    req.session.save();
  }
  console.log(req.session.meow)
  for(let i = 0; i < 10; i++) {
    req.session.save();
  }
  res.send("all good :3");
})

app.post('/searchDish', async (req,res) => {

  var timeToCook = req.body.minutes;

  var complexity = req.body.complexity

  var ingredients = req.body.ingredients

  console.log(req.body)

  var conditions = ingredients.map(value => ({
    'ingredients': { $in: [new RegExp(value, "i")]}
  }));

  conditions.push({ $expr: { $lte: [ { $toInt: '$minutes' }, timeToCook ] } });

  if(complexity == "easy") {
    conditions.push({ $expr: { $lte: [ { $toInt: '$n_steps' }, 6 ] } });
    conditions.push({ $expr: { $lte: [ { $toInt: '$n_ingredients' }, 6] } });
  }
  if(complexity == "medium") {
    conditions.push({ $expr: { $lte: [ { $toInt: '$n_steps' }, 10 ] } });
    conditions.push({ $expr: { $lte: [ { $toInt: '$n_ingredients' }, 10] } });
    conditions.push({ $expr: { $gte: [ { $toInt: '$n_steps' }, 7 ] } });
    conditions.push({ $expr: { $gte: [ { $toInt: '$n_ingredients' }, 7] } });
  }
  if(complexity == "complex") {
    conditions.push({ $expr: { $gte: [ { $toInt: '$n_steps' }, 11 ] } });
    conditions.push({ $expr: { $gte: [ { $toInt: '$n_ingredients' }, 11] } });
  }

  const query = { $and: conditions};

  var dishes = await dishCollection.find(query).toArray();
  if (dishes.length == 0) {
    res.status(204).json({'error': 1})
  } else {
      var dishNum = Math.floor(Math.random() * dishes.length);
      console.log(dishes.length);
      var dish = dishes[dishNum];
      console.log(dish);
      req.session.history.push(dish);
      if(req.session.loggedIn) {
        userCollection.updateOne({username: req.session.username}, {$set: {history: req.session.history}});
      }
      res.json(dish); // Send the dish as a JSON response
    }
})


app.get('/dishcard', (req, res) => {
  res.render('dishCard');
});

app.get('/readMore', (req, res) => {
    var history = req.session.history;
    console.log(history)
    var dish = history.find(element => element.name == req.query.dish);
    if(dish == undefined) {
      res.redirect("/404");
      return
    }
    console.log(req.query.dish)
    res.render('readMorePage', {dish: dish, loggedIn: req.session.loggedIn});
});

app.get('/search', (req, res) => {
  res.render('search');
});

app.get('/logpage', (req, res) => {
  var dishes = [];
  var history = req.session.history;
  for (let i = 0; i < history.length; i++) {
    dishes.push(history[i]);
  }


  res.render('logPage', { dishes, loggedIn: req.session.loggedIn });
});

app.get('/favourites', loginValidation, (req, res) => {
    var dishes = [];
    var favourites = req.session.favourites;
    for (let i = 0; i < favourites.length; i++) {
      dishes.push(favourites[i]);
    }
  
  
    res.render('favourites', { dishes, loggedIn: req.session.loggedIn });
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
    favourites: [],
    history: req.session.history,
    dietaryRestrictions: []
  });
  console.log("Inserted user");

  // var html = "successfully created user";
  // res.send(html);

  req.session.loggedIn= true;
  req.session.username = username;
  req.session.email = email;
  req.session.favourites = [];
  req.session.dietaryRestrictions = [];

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


  const result = await userCollection.find({ email: email }).project({ username: 1, email: 1, password: 1, favourites: 1, history: 1, dietaryRestrictions: 1 }).toArray();

  console.log(result);
  if (result.length != 1) {
    res.render("login_error");
    return;
  }
  if (await bcrypt.compare(password, result[0].password)) {
    console.log("correct password");
    req.session.loggedIn = true;
    req.session.username = result[0].username;
    req.session.favourites = result[0].favourites;
    req.session.history = result[0].history.concat(req.session.history);
    userCollection.updateOne({username: req.session.username}, {$set: {history: req.session.history}});
    req.session.dietaryRestrictions = result[0].dietaryRestrictions;
    req.session.email = email;
    await req.session.save();
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
  res.redirect('/');
});

app.get('/profile', async (req, res) => {
  const result = await userCollection.find().project({ username: 1, email: 1, password: 1, favourites: 1}).toArray();
  if (!req.session.loggedIn) {
    res.render("profile_unauthenticated", {redirectedPrompt : req.query.redirectedPrompt});
  } else {
    res.render("profile", { 
      username: req.session.username,
      users: result,
      email: req.session.email,
      password: req.session.password,
      dietaryRestriction: req.session.dietaryRestrictions
    });
  }
});

app.post('/saveDietaryRestriction', async (req, res) => {
  var dietaryRestriction = req.body.dietaryRestriction;
  var excludedIngredients = [];

  // Check the dietary restriction and assign the corresponding excluded ingredients list
  if (dietaryRestriction === 'Vegetarian') {
    excludedIngredients = [
      "Beef",
      "Pork",
      "Lamb",
      "Chicken",
      "Turkey",
      "Duck",
      "Fish",
      "Salmon",
      "Shrimp",
      "Tuna",
      "Crab",
      "Lobster",
      "Gelatin",
      "Animal fats",
      "Lard",
      "Suet",
      "Tallow",
      "broth",
      "Rennet",
      "Cochineal",
      "Isinglass"
      // Add other vegetarian-excluded ingredients here
    ];
  } else if (dietaryRestriction === 'Vegan') {
    excludedIngredients = [
      "Beef",
      "Pork",
      "Lamb",
      "Chicken",
      "Turkey",
      "Duck",
      "Fish",
      "Salmon",
      "Shrimp",
      "Tuna",
      "Crab",
      "Lobster",
      "Gelatin",
      "Animal fats",
      "Lard",
      "Suet",
      "Tallow",
      "broth",
      "Rennet",
      "Cochineal",
      "Isinglass",
      "milk",
      "cheese",
      "yogurt",
      "butter",
      "cream",
      "whey"
      // Add other vegan-excluded ingredients here
    ];
  } else if (dietaryRestriction === 'Pescatarian') {
    excludedIngredients = [
      "Beef",
      "Pork",
      "Lamb",
      "Chicken",
      // Add other pescatarian-excluded ingredients here
    ];
  } else if (dietaryRestriction === 'Gluten-Free') {
    excludedIngredients = [
      "Wheat",
      "Barley",
      "Rye",
      "Oats",
      "Yeast",
      "Flour",
      "Bran",
      "Farina",
      "Starch",
      "Bran"
    ];
  } else if (dietaryRestriction === 'Dairy-Free') {
    excludedIngredients = [
      "milk",
      "cheese",
      "yogurt",
      "butter",
      "cream",
      "whey"
    ];
  }

  const existingExcludedIngredients = req.session.excludedIngredients || []; // Get the existing excluded ingredients list

  // Merge the existing and new excluded ingredients lists without duplicates
  const mergedExcludedIngredients = Array.from(new Set([...existingExcludedIngredients, ...excludedIngredients]));

  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(dietaryRestriction);
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/profile");
    return;
  }

  const drlist = req.session.dietaryRestrictions || [];
  drlist.push(dietaryRestriction);

  // Update the user's dietary restrictions and excluded ingredients in the database
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { dietaryRestrictions: drlist, excludedIngredients: mergedExcludedIngredients } }
  );

  req.session.dietaryRestrictions = drlist;
  req.session.excludedIngredients = mergedExcludedIngredients;

  res.redirect('/profile');
});

app.post('/removeDietaryRestriction', async (req, res) => {
  const dietaryRestriction = req.body.dietaryRestriction;

  const drlist = req.session.dietaryRestrictions || [];
  const updatedDRList = drlist.filter(item => item !== dietaryRestriction); // Filter out the dietary restriction to be removed

  req.session.dietaryRestrictions = updatedDRList;

  // Update the user's dietary restrictions in the database
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { dietaryRestrictions: updatedDRList } }
  );

  res.redirect('/profile');
});




app.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await dishCollection.distinct("ingredients");
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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
app.post('/favourite', loginValidation, async (req,res) => {
    var history = req.session.history;
    var dish = history.find(element => element.name == req.query.dishName);

    if(dish.numFavs == undefined) {
      dish.numFavs = 0;
    } 

    var favourites = req.session.favourites;
    var username = req.session.username;

    console.log(favourites);

    var removed = false;

    // if(favourites == "") {
    //     favourites = [];
    // }

    for(i = 0; i < favourites.length; i++) {
        if(dish.name == favourites[i].name) {
            favourites.splice(i, 1);
            removed = true;
            dish.numFavs = dish.numFavs-1;
        }
    }
    if(!removed){
        favourites.push(dish);
        dish.numFavs = dish.numFavs+1;
    }
    req.session.favourites = favourites;
    await userCollection.updateOne({username: username}, {$set: {favourites: favourites}});
    await dishCollection.updateOne({id: dish.id}, {$set: {numFavs: dish.numFavs}});
    res.sendStatus(200);
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("errorMessage", {error: "Page Not Found"});
})

app.listen(port, () => {
  console.log("Node application listening on port " + port);
}); 