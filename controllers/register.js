const saltRounds = 10;
const handleRegister = (req, res, db, bcrypt) => {
  // Destructuring
  const {
    email,
    name,
    password
  } = req.body;
  if(!email || !name || !password) {
      return res.status(400).json('Incorrect Form Submission')
  }
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
  };

module.exports = {
    handleRegister: handleRegister
};
