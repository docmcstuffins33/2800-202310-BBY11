const express = require('express');
const router = express.Router();

// Endpoint to render the dishCard view
router.get('/', (req, res) => {
  res.render('dishCard');
});

module.exports = router;
