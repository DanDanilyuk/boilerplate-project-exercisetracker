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
      _id: user._id 
    }));
    res.send(filteredUsers);
  });
})

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const filter = { username: username };
  User.findOneAndUpdate(filter, filter, { upsert: true, new: true }, (err, matchedUser) => {
    if(err) return console.log(err);
    res.json({ username: matchedUser.username, _id: matchedUser._id });
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  const newExercise = {
    userId: userId,
    description: description,
    duration: duration,
    date: date
  }
  User.findById(userId, (err, matchedUser) => {
    if(err) return console.log(err);
    Exercise.create(newExercise, (err, createdExercise) => {
      if(err) return console.log(err);
      res.json({ 
        _id: matchedUser._id,
        username: matchedUser.username, 
        description: createdExercise.description,
        duration: createdExercise.duration,
        date: createdExercise.date.toDateString()
      });
    });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  const exerciseQuery = { userId: userId };
  let query = Exercise.find(exerciseQuery);

  if (limit) {
    query = query.limit(limit);
  };

  if (from) {
    query = query.find({
        date: {
            $gte: new Date(from)
        }
    })
  };

  if (to) {
    query = query.find({
        date: {
            $lt: new Date(to)
        }
    })
  };

    User.findById(userId, (err, matchedUser) => {
    if(err) return console.log(err);
      query.exec((exerciseErr, matchedExercises) => {
        if(exerciseErr) return console.log(exerciseErr);
        const parsedExercises = matchedExercises.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString(),
        }));
        res.json({ username: matchedUser.username, count: parsedExercises.length, _id: matchedUser._id, log: parsedExercises });
      })
    });
  });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
