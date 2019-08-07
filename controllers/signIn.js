const handleSignIn = (req, res, db, bcrypt) => {
   const { email, password } = req.body;
   if(!email || !password) {
        return res.status(400).json('Incorrect Form Submission')
    }
    db.select('email', 'hash').from('login')
      .where('email', '=', email)
      .then(data => {
        // Check hashed password
        // Load hash from your password DB.
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
          return db.select('*').from('users')
              .where('email', '=', email)
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
