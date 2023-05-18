const express = require('express');
const router = express.Router();
const { loginValidation } = require('./sessionValidation');

router.get('/', loginValidation, (req, res) => {
  var dishes = [];
  var favourites = req.session.favourites;
  for (let i = 0; i < favourites.length; i++) {
    dishes.push(favourites[i]);
  }

  res.render('favourites', { dishes });
});

module.exports = router;

