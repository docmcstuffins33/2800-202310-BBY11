const express = require('express');
const router = express.Router();

// Require any necessary modules or models
const { userCollection } = require('../config/databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');
const dishCollection = database.db(mongodb_database).collection("dishes");

// Get a specific dish by name
router.get('/:id', (req, res) => {
  const dishName = req.params.id;

  dishCollection.findOne({ name: dishName })
    .then(dish => {
      if (!dish) {
        return res.status(404).json({ error: 'Dish not found' });
      }

      req.session.history.push(dish);

      if (req.session.loggedIn) {
        userCollection.updateOne(
          { username: req.session.username },
          { $set: { history: req.session.history } }
        );
      }

      res.json(dish);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Get a random dish
router.get('/', (req, res) => {
  dishCollection.findOne()
    .then(dish => {
      if (!dish) {
        return res.status(404).json({ error: 'No dishes found' });
      }

      req.session.history.push(dish);

      if (req.session.loggedIn) {
        userCollection.updateOne(
          { username: req.session.username },
          { $set: { history: req.session.history } }
        );
      }

      res.json(dish);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

module.exports = router;


