const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');

// Endpoint Controllers
const register = require('./controllers/register.js');
const signIn = require('./controllers/signIn.js');
const profile = require('./controllers/profile.js');
const image = require('./controllers/image.js');

// Postgres Database Connection
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : process.env.DATABASE_PASSWORD,
    database : 'smart-brain'
  }
});

// Create our app by running Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

/***
 *  Root Route: / --> res = this is working
 *  SignIn: /signin --> POST = success/fail
 *  Register: /register --> POST = user
 *  Profile: /profile/:userId --> GET
 *  Image: /image --> PUT --> user (count for face detections)
 */

// Get Request on the Root Route
app.get('/', (req, res) => {
    res.send(database.users);
});

// Signin Endpoint
app.post('/signin', (req, res) => { signIn.handleSignIn( req, res, db, bcrypt)});

// Register Endpoint
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt)});

// Profile GET ID Endpoint
app.get('/profile/:id', (req, res) => { profile.handleProfileGET(req, res, db)});

// Image Endpoint
app.put('/image', (req, res) => { image.handleImage(req, res, db)});

// Clarifai API Endpoint
app.post('/imageurl', (req, res) => { image.handleAPICall(req, res)});

// Setup server to listen on Environmental Heroku Port
app.listen(process.env.$PORT, () => {
  console.log(`app is running on port ${process.env.$PORT}`);
});
