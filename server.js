const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cors = require('cors');
const env = require('./env.json');
const database_password = env['database_password'];
const knex = require('knex');

// Postgres Database Connection
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : database_password,
    database : 'smart-brain'
  }
});

// Create our app by running Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

/**
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
app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
      .where('email', '=', req.body.email)
      .then(data => {
        // Check hashed password
        // Load hash from your password DB.
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
          return db.select('*').from('users')
              .where('email', '=', req.body.email)
              .then(user => {
                res.json(user[0])
              })
              .catch(err => res.status(400).json('Unable to get user'))
        } else {
          // If the hash password check is not valid
          res.status(400).json('Incorrect password');
        }
      })
      .catch(err => res.status(400).json('Wrong user credentials'))
});

// Register Endpoint
app.post('/register', (req, res) => {
    // Destructuring
    const { email, name, password } = req.body;
    // Bcrypt
    let hash = bcrypt.hashSync(password, saltRounds);
  // Store hash in your password DB.
  // Creating a transaction
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          // Creating a new user
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
          })
            .then(user => {
              // Grabs the last user in the array
              res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register'));
});

// Profile ID Endpoint
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where('id', id)
      .then(user => {
        if(user.length) { // If a user is found in db
          res.json(user[0]);
        } else {
          res.status(400).json('User profile not found');
        }
      })
      .catch(err => res.status(400).json('Error getting user profile'));
});

// Image Endpoint
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to update entries'))
});

// Setup server to listen on Port 3000
app.listen(3000, () => {
  console.log("app is running on port 3000");
});
