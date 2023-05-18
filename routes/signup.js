const express = require('express');
const router = express.Router();
const Joi = require("joi");
const bcrypt = require('bcrypt');
const saltRounds = 12;

const { userCollection } = require('../config/databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');

router.get('/', (req, res) => {
  res.render("signup");
});

router.post('/signupSubmit', async (req, res) => {
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

  const schema = Joi.object({
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

  req.session.loggedIn = true;
  req.session.username = username;
  req.session.email = email;
  req.session.favourites = [];
  req.session.dietaryRestrictions = [];

  res.redirect('/');
  return;
});

module.exports = router;
