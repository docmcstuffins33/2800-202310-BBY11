const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');

const { userCollection } = require('../config/databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');


router.get('/login', (req, res) => {
  res.render("login");
});

router.post('/loginSubmit', async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  const emailSchema = Joi.string().max(20).required();
  const emailValidationResult = emailSchema.validate(email);
  if (emailValidationResult.error != null) {
    console.log(emailValidationResult.error);
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
    userCollection.updateOne({ username: req.session.username }, { $set: { history: req.session.history } });
    req.session.dietaryRestrictions = result[0].dietaryRestrictions;
    req.session.email = email;
    res.redirect('/profile');
    return;
  } else {
    res.render("login_error");
    return;
  }
});

module.exports = router;
