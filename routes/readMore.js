const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { history } = req.session;
  console.log(history);
  const dishName = req.query.dish;
  console.log(dishName);
  const dish = history.find(element => element.name === dishName);
  res.render('readMorePage', { dish });
});

module.exports = router;

