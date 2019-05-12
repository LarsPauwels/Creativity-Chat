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
	let username = req.query.user;

	User.findOne({username: username}, (err, userDocs)=>{    
        if (userDocs === null || userDocs.length == 0) {
        	res.json({
				"status": "error",
				"message": `Coudn't find a user with username ${username}`	
			});
        } else {
        	res.json({
	            "status": "success",
	            "message": userDocs
	        });
        }
    });

	/*res.json({
		"status": "success",
		"message": `GETTING user with username ${username}`	
	});*/
}

module.exports.getUser = getUser;
module.exports.post = post;