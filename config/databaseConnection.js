// require('dotenv').config();

// const mongodb_host = process.env.MONGODB_HOST;
// const mongodb_user = process.env.MONGODB_USER;
// const mongodb_password = process.env.MONGODB_PASSWORD;

// const MongoClient = require("mongodb").MongoClient;
// const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
// var database = new MongoClient(atlasURI, {useNewUrlParser: true, useUnifiedTopology: true});
// module.exports = {database};

require('dotenv').config();
const { MongoClient } = require('mongodb').MongoClient;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true`;

const client = new MongoClient(atlasURI, { useNewUrlParser: true, useUnifiedTopology: true });

let database;
let userCollection;
let dishCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    database = client.db(mongodb_database);
    userCollection = database.collection('users');
    dishCollection = database.collection('dishes');
    console.log('Connected to the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

module.exports = {
  connectToDatabase,
  userCollection,
  dishCollection,
};
