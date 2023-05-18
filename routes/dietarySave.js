const express = require('express');
const router = express.Router();
const Joi = require("joi");

// Import database connection
const { database } = require('../config/databaseConnection');

// Access userCollection
const userCollection = database.db().collection('users');

router.post('/dietarySave', async (req, res) => {
  var dietaryRestriction = req.body.dietaryRestriction;
  var drlist = req.session.dietaryRestrictions;

  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(dietaryRestriction);
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/profile");
    return;
  }

  drlist.push(dietaryRestriction);
  req.session.dietaryRestrictions = drlist;

  await userCollection.updateOne({ username: req.session.username }, { $set: { dietaryRestrictions: drlist } });
  res.redirect('/profile');
});

module.exports = router;

