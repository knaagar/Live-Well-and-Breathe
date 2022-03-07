const jwt = require("jsonwebtoken");

const loggedIn = (req, res, next) => {
    if(req.cookies.token) {
        req.loggedIn = jwt.verify(req.cookies.token, process.env.TOKEN_SECRET);
    } else {
        req.loggedIn = false;
    }

    next();
};

module.exports = loggedIn;