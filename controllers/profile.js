const handleProfileGET = (req, res, db) => {
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
};

module.exports = {
    handleProfileGET: handleProfileGET
}
