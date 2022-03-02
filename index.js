// globals

const domainName = "https://Live-Well-and-Breathe.stranothus-studios.repl.co";


// load in npm packages

const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { MongoClient } = require('mongodb');


// load in local modules

const { genSalt, genHash, checkHash } = require("./utils/encrypt.js");


// initiate npm packages and set up middleware

const app = express();
const bodyParsing = express.json();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      	cb(null, __dirname + "/public/uploads");
    },
    filename: function (req, file, cb) {
      	cb(null, file.originalname);
    }
});
const formParsing = multer({ storage: storage }).array("file");
const cookies = cookieParser();
const loggedIn = (req, res, next) => {
    if(req.cookies.token) {
        req.loggedIn = jwt.verify(req.cookies.token, process.env.TOKEN_SECRET);
    } else {
        req.loggedIn = false;
    }

    next();
}
const staticPublic = express.static(__dirname + "/public");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_NAME + "@gmail.com",
        pass: process.env.GMAIL_PASSWORD
    }
});

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.syxz1.mongodb.net/users?retryWrites=true&w=majority`;
var client,
    users,
    health,
    articles;

MongoClient.connect(uri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err, db) => {
        if(err) console.error(err);

        client = db;

        users = client.db("users");
        health = client.db("health");
        articles = client.db("articles");
    }
);


// initiate middleware

app.use(bodyParsing);
app.use(formParsing);
app.use(cookies);
app.use(loggedIn);
app.use(staticPublic);


// create routers

const api = express.Router();
const pages = express.Router();


// assign routers

app.use("/api", api);
app.use("/pages", pages);


// initial routing

app.get("/", (req, res) => {
    res.redirect("/pages/home");
});


// pages routing

pages.get("/home", (req, res) => {
    res.sendFile(__dirname + "/public/views/index.html");
});

pages.get("/about", (req, res) => {
  res.sendFile(__dirname + "/public/views/about.html")
});

pages.get("/features", (req, res) => {
  res.sendFile(__dirname + "/public/views/features.html")
});

pages.get("/contact", (req, res) => {
  res.sendFile(__dirname + "/public/views/contact.html")
});

pages.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/views/dashboard.html")
});

pages.get("/sign-up", (req, res) => {
    res.sendFile(__dirname + "/public/views/sign-up.html");
});

pages.get("/add-art", (req, res) => {
    res.sendFile(__dirname + "/public/views/addarticle.html");
});

pages.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/views/login.html");
});

pages.get("/new-password", (req, res) => {
    res.sendFile(__dirname + "/public/views/new-password.html");
});

pages.get("/forgot-password", (req, res) => {
    res.sendFile(__dirname + "/public/views/forgot-password.html");
});

pages.get("/goal/:title", (req, res) => {
    res.sendFile(__dirname + "/public/views/goal.html")
});

pages.get("/create-goal", (req, res) => {
  res.sendFile(__dirname + "/public/views/create-goal.html");
});

pages.get("/food-suggest", (req, res) => {
  res.sendFile(__dirname + "/public/views/food-suggest.html");
});

pages.get("/self-care", (req, res) => {
  res.sendFile(__dirname + "/public/views/self-care.html");
});

pages.get("/sleep-track", (req, res) => {
  res.sendFile(__dirname + "/public/views/sleep-track.html");
});

pages.get("/inspire", (req, res) => {
  res.sendFile(__dirname + "/public/views/inspire.html");
});

pages.get("/profile", (req, res) => {
  res.sendFile(__dirname + "/public/views/profile.html");
});

pages.get("/tools", (req, res) => {
  res.sendFile(__dirname + "/public/views/tools.html");
});

pages.get("/profile/settings", (req, res) => {
  res.sendFile(__dirname + "/public/views/settings.html");
});

pages.get("/self-care/article1", (req, res) => {
  res.sendFile(__dirname + "/public/views/article1.html");
});

pages.get("/self-care/article2", (req, res) => {
  res.sendFile(__dirname + "/public/views/article2.html");
});

pages.get("/self-care/article3", (req, res) => {
  res.sendFile(__dirname + "/public/views/article3.html");
});

pages.get("/meditate", (req, res) => {
  res.sendFile(__dirname + "/public/views/meditate.html");
});





// api routing

// create sign up endpoint

api.post("/sign-up", (req, res) => {
    let body = req.body;

    if(body.email && body.name && body.password && body.confirmPassword && body.age) {
        if(!body.email.match(/[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            // invalid email
            res.status(400).redirect("back");
        } else if(body.password !== body.confirmPassword) {
            // nonmatching passwords
            res.status(400).redirect("/pages/sign-up");
        } else if(!/[A-Z].*[A-Z]/.test(body.password) || !/[0-9].*[0-9]/.test(body.password) || body.password.length < 8) {
            // weak password (must have at least 2 uppercase letters and 2 digits with a total password length of 8 or more characters)
            res.status(400).redirect("/pages/sign-up");
        } else {
            users.collection("accounts").findOne({ "email" : body.email }, async (err, result) => {
                if(err) console.error(err);

                if(!result) {
                    // create account
                    let salt = await genSalt(Math.floor(Math.random() * 10));
                    let hash = await genHash(body.password, salt);

                    let userObj = {
                        hash: hash,
                        email: body.email,
                        name: body.name,
                        created: new Date(),
                        confirmed: false,
                        age: body.age,
                        goals: []
                        // primary focus
                        // schedule
                    };

                    users.collection("accounts").insertOne(userObj, (err, result) => {
                        if(err) console.error(err);

                        let token = jwt.sign(userObj, process.env.VERIFY_SECRET);

                        let mailOptions = {
                            from: process.env.GMAIL_NAME + "@gmail.com",
                            to: userObj.email,
                            subject: "Verify your Account",
                            text: `Follow the link below to verify your Live Well And Breathe account: ${domainName}/api/verify/${token}`,
                            html: `
                            <!DOCTYPE html>
                            <html>
                                <head>
                                    <meta charset = "utf-8">
                                    <title>Verify your Account</title>
                                    <style>
                                        * {
                                            margin : 0;
                                            padding : 0;
                                        }

                                        body {
                                            background-color : none;
                                        }

                                        #main {
                                            margin : 50px 100px;
                                            padding : 25px 50px;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div id = "main">
                                        <p>Follow the link below to verify your Live Well And Breathe account:</p>
                                        <a href = "${domainName}/api/verify/${token}">Verify</a>
                                        <p>If you have not created a Live Well and Breathe account through this email, someone may be impersonting you or using your email. Do not click the above link, and you can reply to this email for the account to be terminated, if necessary.</p>
                                    </div>
                                </body>
                            </html>`
                        };

                        transporter.sendMail(mailOptions, function(err, result) {
                            if (err) console.error(err);

                            let token = jwt.sign(result, process.env.TOKEN_SECRET);

                            res.cookie("token", token);
                            res.send("Please confirm your email");
                        });
                    });
                    
                } else {
                    res.status(400).redirect("/pages/login");
                    // account already exists
                }
            });
        }
    } else {
        // missing body values
        res.status(400).redirect("/pages/sign-up");
    }
});

api.post("/add-art", (req, res) => {
  let body = req.body;

  let post = {
    name: body.name,
    content: body.content,
    created: new Date()
  };

  articles.collection("posts").insertOne(post);

  res.redirect('/pages/self-care');
});

api.get("/verify/:token", (req, res) => {
    let params = req.params;
    let token = params.token;
        token = jwt.verify(token, process.env.VERIFY_SECRET);
    
    users.collection("accounts").updateOne({ "email" : token.email }, { "$set" : { "confirmed" : true }}, (err, result) => {
        if(err) console.error(err);

        token.confirmed = true;
        token = jwt.sign(token, process.env.TOKEN_SECRET);

        res.cookie("token", token);
        res.status(200).redirect("/pages/home");
    });
});

api.post("/login", (req, res) => {
    let body = req.body;

    if(body.email && body.password) {
        users.collection("accounts").findOne({ "email" : body.email }, async (err, result) => {
            if(err) console.error(err);

            if(result) {
                if(await checkHash(body.password, result.hash)) {
                    let token = jwt.sign(result, process.env.TOKEN_SECRET);

                    res.cookie("token", token);
                    res.redirect("/pages/home");
                } else {
                    res.status(403).redirect("/pages/login");
                }
            } else {
                res.status(400).redirect("/pages/sign-up");
            }
        })
    } else {
        res.status(400).redirect("/pages/login");
    }
});

api.post("/new-password", (req, res) => {
    let body = req.body;

    if(body.email && body.oldPassword && body.newPassword && body.confirmPassword) {
        // check if passwords are valid
        if(body.newPassword !== body.confirmPassword) {
            // nonmatching passwords
            res.status(400).redirect("back");
        } else if(!/[A-Z].*[A-Z]/.test(body.newPassword) || !/[0-9].*[0-9]/.test(body.newPassword) || body.newPassword.length < 8) {
            // weak password (must have at least 2 uppercase letters and 2 digits with a total password length of 8 or more characters)
            res.status(400).redirect("back");
        } else {
            users.collection("accounts").findOne({ "email" : body.email }, async (err, result) => {
                if(err) console.error(err);

                if(result) {
                    if(await checkHash(body.oldPassword, result.hash)) {
                        let salt = await genSalt(Math.floor(Math.random() * 10));
                        let hash = await genHash(body.newPassword, salt);

                        users.collection("accounts").updateOne({ "email" : body.email }, { "$set" : { "hash" : hash }}, (err, result) => {
                            if(err) console.error(err);

                            let token = jwt.sign(result, process.env.TOKEN_SECRET);

                            res.cookie("token", token);
                            res.redirect("/pages/home");
                        });
                    } else {
                        res.status(400).redirect("back");
                    }
                } else {
                    res.status(400).redirect("back");
                }
            });
        }
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/new-name", (req, res) => {
    let body = req.body;

    if(body.name && req.loggedIn) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$set" : { "name" : body.name }}, (err, result) => {
            if(err) console.error(err);

            let token = jwt.sign(result, process.env.TOKEN_SECRET);

            res.cookie("token", token);
            res.status(204).send();
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/new-email", (req, res) => {
    let body = req.body;

    if(body.email && req.loggedIn) {
        if(!body.email.match(/[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            // invalid email
            res.status(400).redirect("back");

        } else {
            users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$set" : { "email" : body.email, "confirmed" : false }}, (err, result) => {
                if(err) console.error(err);

                let token = jwt.sign(userObj, process.env.VERIFY_SECRET);

                let mailOptions = {
                    from: process.env.GMAIL_NAME + "@gmail.com",
                    to: userObj.email,
                    subject: "Verify your New Email",
                    text: `Follow the link below to verify your new Live Well And Breathe email: ${domainName}/api/verify/${token}`,
                    html: `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset = "utf-8">
                            <title>Verify your New Email</title>
                            <style>
                                * {
                                    margin : 0;
                                    padding : 0;
                                }

                                body {
                                    background-color : none;
                                }

                                #main {
                                    margin : 50px 100px;
                                    padding : 25px 50px;
                                }
                            </style>
                        </head>
                        <body>
                            <div id = "main">
                                <p>Follow the link below to verify your new Live Well And Breathe email:</p>
                                <a href = "${domainName}/api/verify/${token}">Verify</a>
                                <p>If you have not requested this email be set to your new Live Well and Breathe email, there may have been a mistake. You can ignore the link above. </p>
                            </div>
                        </body>
                    </html>`
                };

                transporter.sendMail(mailOptions, function(err, result) {
                    if (err) console.error(err);

                    let token = jwt.sign(result, process.env.TOKEN_SECRET);

                    res.cookie("token", token);
                    res.send("Please confirm your new email");
                });
            });
        }
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/forgot-password", (req, res) => {
    let body = req.body;

    if(body.email) {
        users.collection("accounts").findOne({ "email" : body.email }, (err, result) => {
            if(err) console.error(err);

            if(result) {
                let token = jwt.sign(result, process.env.RESET_SECRET);

                let mailOptions = {
                    from: process.env.GMAIL_NAME + "@gmail.com",
                    to: result.email,
                    subject: "Reset Password",
                    text: `Follow the link below to reset your Live Well and Breathe password: ${domainName}/api/reset-password/${token}`,
                    html: `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset = "utf-8">
                            <title>Reset Password</title>
                            <style>
                                * {
                                    margin : 0;
                                    padding : 0;
                                }

                                body {
                                    background-color : none;
                                }

                                #main {
                                    margin : 50px 100px;
                                    padding : 25px 50px;
                                }
                            </style>
                        </head>
                        <body>
                            <div id = "main">
                                <p>Follow the link below to reset your Live Well and Breathe password:</p>
                                <a href = "${domainName}/api/get-reset-password/${token}">Reset</a>
                            </div>
                        </body>
                    </html>`
                };

                transporter.sendMail(mailOptions, function(err, result) {
                    if (err) console.error(err);

                    res.send("Please check your email");
                });
            } else {
                res.status(400).redirect("back");
            }
        })
    } else {
        res.status(400).redirect("back");
    }
});

api.get("/get-reset-password/:token", (req, res) => {
    let params = req.params,
        token = params.token;
        
    if(token) {
        res.send(`<form action = "/api/reset-password/${token}" method = "POST" enctype = "multipart/form-data"><input type = "password" name = "newPassword"><input type = "password" name = "confirmPassword"><button>Submit</button></form>`);
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/reset-password/:token", async (req, res) => {
    let params = req.params,
        token = params.token;
        token = jwt.verify(token, process.env.RESET_SECRET);
    let body = req.body;

    if(token && body.newPassword && body.confirmPassword) {
        // check if passwords are valid
        if(body.newPassword !== body.confirmPassword) {
            // nonmatching passwords
            res.status(400).redirect("back");
        } else if(!/[A-Z].*[A-Z]/.test(body.newPassword) || !/[0-9].*[0-9]/.test(body.newPassword) || body.newPassword.length < 8) {
            // weak password (must have at least 2 uppercase letters and 2 digits with a total password length of 8 or more characters)
            res.status(400).redirect("back");
        } else {
            let salt = await genSalt(Math.floor(Math.random() * 10));
            let hash = await genHash(body.newPassword, salt);

            users.collection("accounts").updateOne({ "email" : token.email }, { "$set" : { "hash" : hash }}, (err, result) => {
                if(err) console.error(err);
                
                let token = req.loggedIn;
                    token.hash = hash;
                    token = jwt.sign(result, process.env.TOKEN_SECRET);

                res.cookie("token", token);
                res.redirect("/pages/home");
            });
        }
    } else {
        res.status(400).redirect("back");
    }
});


api.get("/update-token", (req, res) => {
    if(req.loggedIn) {
        users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, (err, result) => {
            if(err) console.error(err);

            let token = jwt.sign(result, process.env.TOKEN_SECRET);

            res.cookie("token", token);
            res.status(204).send("Token updated");
        });
    } else {
        res.clearCookie("token");
        res.status(204).send("Token updated");
    }
});

api.post("/delete-account", (req, res) => {
    let body = req.body;

    if(req.loggedIn && body.password) {
        users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, async function(err, result) {
            if(err) console.error(err);

            if(result) {
                if(await checkHash(body.password, result.hash)) {
                    users.collection("accounts").deleteOne({ "hash" : req.loggedIn.hash }, function(err, result) {
                        if(err) console.error(err);

                        res.clearCookie("token");
                        res.status(200).redirect("/pages/sign-up");
                    })
                } else {
                    res.status(403).redirect("back");
                }
            } else {
                res.status(400).redirect("back");
            }
        })
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/contact-email", (req, res) => {
    let body = req.body;

    if(body.email && body.content && body.name) {
        if(!body.email.match(/[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            // invalid email
            res.status(400).redirect("back");
        } else {
            let mailOptions = {
                from: process.env.GMAIL_NAME + "@gmail.com",
                to: "stranothus@gmail.com",
                subject: "Contact Email",
                text: ``,
                html: `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset = "utf-8">
                        <title>Contact Email</title>
                        <style>
                            * {
                                margin : 0;
                                padding : 0;
                            }

                            body {
                                background-color : none;
                            }

                            #main {
                                margin : 50px 100px;
                                padding : 25px 50px;
                            }
                        </style>
                    </head>
                    <body>
                        <div id = "main">
                            <p>${body.name} (${body.email}) has contacted you from Live Well and Breathe.</p>
                            <p>${body.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                        </div>
                    </body>
                </html>`
            };

            transporter.sendMail(mailOptions, function(err, result) {
                if (err) console.error(err);

                res.send("Email sent");
            });
        }
    } else {
        res.status(400).redirect("back");
    }
});

api.get("/user", (req, res) => {
    let toReturn = req.loggedIn;
    delete toReturn.hash;
    delete toReturn._id;
    delete toReturn.iat;
    res.json(toReturn);
});

api.post("/new-goal", (req, res) => {
    let body = req.body;

    if(req.loggedIn && body.title && body.completeBy && body.desc && body.urgency) {
        let goalObj = {
            title: body.title,
            completeBy: new Date(body.completeBy),
            desc: body.desc,
            urgency: body.urgency,
            created: new Date(),
            completed: false,
            progress: []
        };

        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$push" : { "goals" : goalObj }}, (err, result) => {
            if(err) console.error(err);

            let token = req.loggedIn;
                token.goals.push(goalObj);
                token = jwt.sign(token, process.env.TOKEN_SECRET);
            
            res.cookie("token", token);
            res.status(200).redirect("/pages/dashboard");
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/goal-progress", (req, res) => {
    let body = req.body;

    if(req.loggedIn && body.created && body.progress) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash, "goals.created" : new Date(body.created) }, { "$push" : { "goals.$.progress" :  body.progress }}, (err, result) => {
            if(err) console.error(err);

            users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, (err, result) => {
                if(err) console.error(err);

                let token = jwt.sign(result, process.env.TOKEN_SECRET);

                res.cookie("token", token);
                res.status(200).redirect('back');
            });
        });
    } else {
        res.status(400).redirect("back");
    }
});


api.post("/goal-finish", (req, res) => {
    let body = req.body;

    if(req.loggedIn && body.created) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash, "goals.created" : new Date(body.created) }, { "$set" : {"goals.$.completed" : true }}, (err, result) => {
            if(err) console.error(err);

            users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, (err, result) => {
                if(err) console.error(err);

                let token = jwt.sign(result, process.env.TOKEN_SECRET);

                res.cookie("token", token);
                res.status(200).redirect("/pages/dashboard");
            });
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/goal-delete", (req, res) => {
    let body = req.body;

    if(req.loggedIn && body.created) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$pull" : { "goals" : { "created" : new Date(body.created) }}}, function(err, result) {
            if(err) console.error(err);

            users.collection("accounts").findOne({ "hash" : req.loggedIn.hash }, (err, result) => {
                if(err) console.error(err);

                let token = jwt.sign(result, process.env.TOKEN_SECRET);

                res.cookie("token", token);
                res.status(200).redirect("/pages/dashboard");
            });
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).redirect("/pages/login");
});

api.get("/foods", (req, res) => {
    health.collection("food").find({ }).toArray(function(err, results) {
        if(err) console.error(err);

        res.json(results);
    });
});

api.get("/articles", (req, res) => {
    articles.collection("posts").find({ }).toArray(function(err, results) {
        if(err) console.error(err);

        res.json(results);
    });
});

api.get("/food-for/:condition", (req, res) => {
    let params = req.params;
    let condition = params.condition;

    health.collection("food").find({ "issue": { "$regex": new RegExp(condition, "i") }}).toArray(function(err, results) {
        if(err) console.error(err);

        res.json(results);
    });
});


// set up port

app.listen(3030, () => {
    console.log("Listening on port 3030");
});
