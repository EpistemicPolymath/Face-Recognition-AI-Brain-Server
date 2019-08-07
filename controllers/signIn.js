const handleSignIn = (db, bcrypt) => (req, res) => {
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
};

module.exports = {
    handleSignIn: handleSignIn
};
