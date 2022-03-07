const jwt = require("jsonwebtoken");

function updateToken(users) {
		return async (req, res) => await new Promise((resolve, reject) => 
				users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, (err, result) => {
						if(err) {
								reject(err);
								return;
						}

						const token = jwt.sign(result, process.env.TOKEN_SECRET);
						res.cookie("token", token);

						resolve(token);
				})
		);
}

module.exports = updateToken;