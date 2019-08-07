// Clarifai
const Clarifai = require('clarifai');
// Global Environmental Variables for API - For Privacy
const env = require('../env.json');
const apikey = env['apikey'];
//Clarifai Initialization
const app = new Clarifai.App ({
    apiKey: apikey
});

const handleAPICall = (req, res) => {
  app.models
     .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
     .then(data => res.json(data))
     .catch(err => res.status(400).json('Unable to work with API'))
}


const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to update entries'))
};

module.exports = {
    handleImage: handleImage,
    handleAPICall: handleAPICall
};
