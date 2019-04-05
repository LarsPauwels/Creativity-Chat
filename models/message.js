let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let messageSchema = new Schema({
  text: String,
  user: String,
  timestamp: Date,
})

let Message = mongoose.model("Message", messageSchema)

module.exports = Message;