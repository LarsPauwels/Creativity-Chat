const Message = require('../models/message');

let post = (req, res) => {
    let user = req.body.user;
    let text = req.body.text;
    let timestamp = getTimestamp(); 
    
    let m = new Message();
    m.user = user;
    m.text = text;
    m.timestamp = timestamp;
    m.save();
}

function getTimestamp(){
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth()+1;
    let day = d.getDate();
    let hour = d.getHours();
    let minutes = d.getMinutes();

    if( hour < 10){
        hour = "0" + hour;
    }

    if(minutes < 10){
        minutes = "0" + minutes;
    }

    return timestamp = `${day}/${month}/${year} ${hour}:${minutes}`;

}

module.exports.post = post;
