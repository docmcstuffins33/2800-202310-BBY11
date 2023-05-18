require('./utils.js');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
const Joi = require('joi');

const expireTime = 60 * 60 * 1000; // expires after 1 hour (minutes * seconds * millis)

const { connectToDatabase } = require('./databaseConnection');
connectToDatabase();

/* Secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
    cookie: {
      maxAge: expireTime,
    },
  })
);
// Routes
const dishRouter = require('./routes/dish');
const dishCardRouter = require('./routes/dishCard');
const readMoreRouter = require('./routes/readMore');
const searchRouter = require('./routes/search');
const logPageRouter = require('./routes/logPage');
const favouritesRouter = require('./routes/favourites');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const profileRouter = require('./routes/profile');
const dietarySaveRouter = require('./routes/dietarySave');
const resetRouter = require('./routes/reset');

// Routes
app.use('/dish', dishRouter);
app.use('/dishCard', dishCardRouter);
app.use('/readMore', readMoreRouter);
app.use('/search', searchRouter);
app.use('/logPage', logPageRouter);
app.use('/favourites', favouritesRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/profile', profileRouter);
app.use('/dietarySave', dietarySaveRouter);
app.use('/reset', resetRouter);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('errorMessage', { error: 'Page Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


