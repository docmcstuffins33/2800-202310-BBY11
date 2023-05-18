const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('search');
});

module.exports = router;
