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

// Database Variable
const database = {
    users: [
        {
          id: '123',
          name: 'Poly',
          password: 'gaming',
          email: 'poly@gmail.com',
          entries: 0,
          joined: new Date()
        },
        {
          id: '124',
          name: 'Dan',
          password: 'workout',
          email: 'dan@gmail.com',
          entries: 0,
          joined: new Date()
        }
    ],
    login: [
        {
          id: '987',
          hash: '',
          email: 'poly@gmail.com',

        },
    ]
}

// Get Request on the Root Route
app.get('/', (req, res) => {
    res.send(database.users);
});

// Signin Endpoint
app.post('/signin', (req, res) => {
  // Load hash from your password DB.
  bcrypt.compare('gaming', '$2b$10$EgGfOvi30VFWb0dv1fKgyekEScbpIYNX1YkpSFQARKE46o7nAX9Hq').then(function(res) {
      // res == true
      console.log('Hash password Worked', res);
  });
  bcrypt.compare('veggies', '$2b$10$EgGfOvi30VFWb0dv1fKgyekEScbpIYNX1YkpSFQARKE46o7nAX9Hq').then(function(res) {
      // res == false
      console.log('Hash password failed', res);
  });
  // We would ideally loop through the database
  if (req.body.email === database.users[0].email &&
      req.body.password === database.users[0].password) {
        res.json(database.users[0]);
      } else {
        res.status(400).json('error logging in');
      }
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


/**
 *  Root Route: / --> res = this is working
 *  SignIn: /signin --> POST = success/fail
 *  Register: /register --> POST = user
 *  Profile: /profile/:userId --> GET
 *  Image: /image --> PUT --> user (count for face detections)
 */
