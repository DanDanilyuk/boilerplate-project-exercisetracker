const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })); 
const mySecret = process.env['MONGO_URI'];
const mongoose = require('mongoose');
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
const cors = require('cors')

const userSchema = new Schema({
  username: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const findUserWithExercises = function() {

}

const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now() }
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  User.find({}, function (err, users) {
    if(err) return console.log(err);
    const filteredUsers = users.map(user => ({
      username: user.username,
      id: user._id 
    }));
    res.send(filteredUsers);
  });
})

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const filter = { username: username };
  User.findOneAndUpdate(filter, filter, { upsert: true, new: true }, (err, matchedUser) => {
    if(err) return console.log(err);
    res.json({ username: matchedUser.username, id: matchedUser._id });
  });
});

app.post('/api/users/:id/exercises', (req, res) => {
  const userId = req.params.id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  const newExercise = {
    userId: userId,
    description: description,
    duration: duration,
    date: date
  }
  Exercise.create(newExercise, (err, createdExercise) => {
    if(err) return console.log(err);
  });

  User.findById(userId, (err, matchedUser) => {
    if(err) return console.log(err);
    const exerciseQuery = { userId: userId };
    Exercise.find(exerciseQuery, (exerciseErr, matchedExercises) => {
      if(exerciseErr) return console.log(exerciseErr);
      const parsedExercises = matchedExercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      }));
      res.json({ username: matchedUser.username, id: matchedUser._id, exercises: parsedExercises });
    })
  });
});

app.get('/api/users/:id/logs', (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, matchedUser) => {
    if(err) return console.log(err);
    const exerciseQuery = { userId: userId };
    Exercise.find(exerciseQuery, (exerciseErr, matchedExercises) => {
      if(exerciseErr) return console.log(exerciseErr);
      const parsedExercises = matchedExercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      }));
      res.json({ username: matchedUser.username, id: matchedUser._id, exercises: parsedExercises });
    })
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
