const User = require('../models/user');

let post = (req, res) => {
    var u = new User(req.body);
    u.save().then(item => {
      res.json({
        "status": "success",
        "message": `Created user with data: {username: ${req.body.username}}`
    });
  }).catch(err => {
      res.status(400).send("unable to save to database");
  });
}

let getUser = (req, res) => {
	if (req.query.user != null) {
        let username = req.query.user;

        User.findOne({username: username}, (err, userDocs)=>{    
            if (userDocs === null || userDocs.length == 0) {
                res.json({
                    "status": "error",
                    "message": `Coudn't find a user with username ${username}`  
                });
            } else {
                User.updateOne(
                    {'_id': userDocs["_id"]},
                    {$set: {active: 1}},
                    (err, updateObject) => {
                        if (!err) {
                            res.json({
                                "status": "success",
                                "message": userDocs
                            });
                        }
                    }
                );
            }
        });
    } else {
        User.find((err, userDocs)=>{    
            if (userDocs === null || userDocs.length == 0) {
                res.json({
                    "status": "error",
                    "message": `Coudn't find any user`  
                });
            } else {
                res.json({
                    "status": "success",
                    "message": userDocs
                });
            }
        });
    }
}

let logout = (req, res) => {
    let user = req.query.user;

    User.updateOne(
        {'username': user},
        {$set: {active: 0}},
        (err, updateObject) => {
            if (!err) {
                res.json({
                    "status": "success",
                    "message": `${user} logged out.`
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

module.exports.logout = logout;
module.exports.getUser = getUser;
module.exports.post = post;