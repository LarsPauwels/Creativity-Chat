const Message = require('../models/message');

let post = (req, res) => {
    let user = req.body.user;
    let text = req.body.text;
    let timestamp = getTimestamp(); 
    
    let m = new Message();
    m.user = user;
    m.text = text;
    m.timestamp = timestamp;
    m.save((err, product) => {
        let id = product._id;
        
        res.json({
            "status": "success",
            "message": `Created message`,
            "id": id
        });
    });
}

let get = (req, res) => {
    Message.find((err, userDocs)=>{    
        if (userDocs === null || userDocs.length == 0) {
            res.json({
                "status": "error",
                "message": `Coudn't find any message`  
            });
        } else {
            res.json({
                "status": "success",
                "message": userDocs
            });
        }
    });
}

let putId = (req, res) => {
    let id = req.params.id;
    let text = req.body.text;

    Message.updateOne(
        {'_id': id},
        {$set: {text: text}},
        (err, updateObject) => {
            if (!err) {
                res.json({
                    "status": "success",
                    "message": updateObject
                });
            } else {
                res.json({
                    "status": "error",
                    "message": err
                });
            }
        }
    );
}

let deleteId = (req, res) => {
    let id = req.params.id;

    Message.findOneAndDelete({'_id': id}, (err, done)=>{
        if (!err) {
            res.json({
                "status": "success",
                "data": {
                    "message": `The message was removed!`
                }
            });
        } else {
            res.json({
                "status": "error",
                "data": {
                    "message": err
                }
            });
        }
    });
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

module.exports.deleteId = deleteId;
module.exports.putId = putId;
module.exports.get = get;
module.exports.post = post;
