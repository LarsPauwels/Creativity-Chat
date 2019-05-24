let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let userSchema = new Schema({
  username: String,
  password: String,
  active: Number,
  timestamp: String
});

let User = mongoose.model("Users", userSchema)

module.exports = User;