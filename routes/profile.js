const express = require('express');
const router = express.Router();

const { userCollection } = require('../config/databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');

router.get('/', async (req, res) => {
  if (!req.session.loggedIn) {
    res.render("profile_unauthenticated", { redirectedPrompt: req.query.redirectedPrompt });
  } else {
    const result = await userCollection.find().project({ username: 1, email: 1, password: 1, favourites: 1 }).toArray();
    res.render("profile", {
      username: req.session.username,
      users: result,
      email: req.session.email,
      password: req.session.password,
      dietaryRestriction: req.session.dietaryRestrictions
    });
  }
});

module.exports = router;

