const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  var dishes = [];
  var history = req.session.history;
  for (let i = 0; i < history.length; i++) {
    dishes.push(history[i]);
  }

  res.render('logPage', { dishes });
});

module.exports = router;
