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
  username: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const filter = { username: username };
  User.findOneAndUpdate(filter, filter, { upsert: true, new: true }, (err, matchedUser) => {
    if(err) return console.log(err);
    res.json({ username: matchedUser.username, id: matchedUser._id });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
