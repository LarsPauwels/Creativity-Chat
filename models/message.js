let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let messageSchema = new Schema({
  text: String,
  user: String,
  timestamp: String
});

let Message = mongoose.model("messages", messageSchema)

module.exports = Message;