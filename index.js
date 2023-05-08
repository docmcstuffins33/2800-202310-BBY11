require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
const Joi = require("joi");

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

app.set('view engine', 'ejs');

app.get('/', (req,res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 