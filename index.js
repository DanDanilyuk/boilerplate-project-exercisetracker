const express = require('express')
const app = express()
app.use(bodyParser.urlencoded({ extended: true })); 
const mongoose = require('mongoose');
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
const cors = require('cors')
const bodyParser = require('body-parser')
const Schema = mongoose.Schema;
const mySecret = process.env['MONGO_URI'];
require('dotenv').config()

const userSchema = new Schema({
  username: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
