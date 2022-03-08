// globals

const domainName = "https://Live-Well-and-Breathe.stranothus-studios.repl.co";


// load in npm packages

const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { MongoClient } = require('mongodb');
const sanitizeHtml = require("sanitize-html");
const ObjectId = require('mongodb').ObjectId;


// load in local modules

const { genSalt, genHash, checkHash } = require("./utils/encrypt.js");
const loggedIn = require("./utils/loggedIn.js");
let updateToken = require("./utils/updateToken.js");
const email = require("./utils/emails.js");


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

				updateToken = updateToken(users);
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

pages.get("/home", (req, res) => res.sendFile(__dirname + "/public/views/index.html"));
pages.get("/about", (req, res) => res.sendFile(__dirname + "/public/views/about.html"));
pages.get("/features", (req, res) => res.sendFile(__dirname + "/public/views/features.html"));
pages.get("/contact", (req, res) => res.sendFile(__dirname + "/public/views/contact.html"));
pages.get("/dashboard", (req, res) => res.sendFile(__dirname + "/public/views/dashboard.html"));
pages.get("/sign-up", (req, res) => res.sendFile(__dirname + "/public/views/sign-up.html"));
pages.get("/add-art", (req, res) => res.sendFile(__dirname + "/public/views/addarticle.html"));
pages.get("/login", (req, res) => res.sendFile(__dirname + "/public/views/login.html"));
pages.get("/new-password", (req, res) => res.sendFile(__dirname + "/public/views/new-password.html"));
pages.get("/forgot-password", (req, res) => res.sendFile(__dirname + "/public/views/forgot-password.html"));
pages.get("/goal/:title", (req, res) => res.sendFile(__dirname + "/public/views/goal.html"));
pages.get("/create-goal", (req, res) => res.sendFile(__dirname + "/public/views/create-goal.html"));
pages.get("/food-suggest", (req, res) => res.sendFile(__dirname + "/public/views/food-suggest.html"));
pages.get("/self-care", (req, res) => res.sendFile(__dirname + "/public/views/self-care.html"));
pages.get("/sleep-track", (req, res) => res.sendFile(__dirname + "/public/views/sleep-track.html"));
pages.get("/inspire", (req, res) => res.sendFile(__dirname + "/public/views/inspire.html"));
pages.get("/profile", (req, res) => res.sendFile(__dirname + "/public/views/profile.html"));
pages.get("/tools", (req, res) => res.sendFile(__dirname + "/public/views/tools.html"));
pages.get("/profile/settings", (req, res) => res.sendFile(__dirname + "/public/views/settings.html"));
pages.get("/self-care/article1", (req, res) => res.sendFile(__dirname + "/public/views/article1.html"));
pages.get("/self-care/article2", (req, res) => res.sendFile(__dirname + "/public/views/article2.html"));
pages.get("/self-care/article3", (req, res) => res.sendFile(__dirname + "/public/views/article3.html"));
pages.get("/meditate", (req, res) => res.sendFile(__dirname + "/public/views/meditate.html"));


// api routing

// create sign up endpoint

api.post("/sign-up", (req, res) => {
    const body = req.body;

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
                    const salt = await genSalt(Math.floor(Math.random() * 10));
                    const hash = await genHash(body.password, salt);

                    const userObj = {
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

                        const token = jwt.sign(userObj, process.env.VERIFY_SECRET);

                        const mailOptions = {
                            from: process.env.GMAIL_NAME + "@gmail.com",
                            to: userObj.email,
                            subject: "Verify your Account",
                            text: `Follow the link below to verify your Live Well And Breathe account: ${domainName}/api/verify/${token}`,
                            html: email.signup(domainName, token)
                        };

                        transporter.sendMail(mailOptions, function(err, result) {
                            if (err) console.error(err);

                            const token = jwt.sign(result, process.env.TOKEN_SECRET);

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
  const body = req.body;
  const html = body.content;
  const sanitized = sanitizeHtml(html);

  const post = {
    name: body.name,
    content: sanitized,
    created: new Date(),
    user: body.user
  };

  articles.collection("posts").insertOne(post);

  res.redirect('/pages/self-care');
});

api.get("/verify/:token", (req, res) => {
    const params = req.params;
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
    const body = req.body;

    if(body.email && body.password) {
        users.collection("accounts").findOne({ "email" : body.email }, async (err, result) => {
            if(err) console.error(err);

            if(result) {
                if(await checkHash(body.password, result.hash)) {
                    const token = jwt.sign(result, process.env.TOKEN_SECRET);

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
    const body = req.body;

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
                        const salt = await genSalt(Math.floor(Math.random() * 10));
                        const hash = await genHash(body.newPassword, salt);

                        users.collection("accounts").updateOne({ "email" : body.email }, { "$set" : { "hash" : hash }}, (err, result) => {
                            if(err) console.error(err);

                            const token = jwt.sign(result, process.env.TOKEN_SECRET);

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
    const body = req.body;

    if(body.name && req.loggedIn) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$set" : { "name" : body.name }}, (err, result) => {
            if(err) console.error(err);

            const token = jwt.sign(result, process.env.TOKEN_SECRET);

            res.cookie("token", token);
            res.status(204).send();
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/new-email", (req, res) => {
    const body = req.body;

    if(body.email && req.loggedIn) {
        if(!body.email.match(/[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            // invalid email
            res.status(400).redirect("back");

        } else {
            users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$set" : { "email" : body.email, "confirmed" : false }}, (err, result) => {
                if(err) console.error(err);

                const token = jwt.sign(userObj, process.env.VERIFY_SECRET);

                const mailOptions = {
                    from: process.env.GMAIL_NAME + "@gmail.com",
                    to: userObj.email,
                    subject: "Verify your New Email",
                    text: `Follow the link below to verify your new Live Well And Breathe email: ${domainName}/api/verify/${token}`,
                    html: email.verify(domainName, token)
                };

                transporter.sendMail(mailOptions, function(err, result) {
                    if (err) console.error(err);

                    const token = jwt.sign(result, process.env.TOKEN_SECRET);

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
    const body = req.body;

    if(body.email) {
        users.collection("accounts").findOne({ "email" : body.email }, (err, result) => {
            if(err) console.error(err);

            if(result) {
                const token = jwt.sign(result, process.env.RESET_SECRET);

                const mailOptions = {
                    from: process.env.GMAIL_NAME + "@gmail.com",
                    to: result.email,
                    subject: "Reset Password",
                    text: `Follow the link below to reset your Live Well and Breathe password: ${domainName}/api/reset-password/${token}`,
                    html: email.forgotPassword(domainName, token)
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
    const params = req.params,
        token = params.token;
        
    if(token) {
        res.send(`<form action = "/api/reset-password/${token}" method = "POST" enctype = "multipart/form-data"><input type = "password" name = "newPassword"><input type = "password" name = "confirmPassword"><button>Submit</button></form>`);
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/reset-password/:token", async (req, res) => {
    const params = req.params;
  	let token = params.token;
        token = jwt.verify(token, process.env.RESET_SECRET);
    const body = req.body;

    if(token && body.newPassword && body.confirmPassword) {
        // check if passwords are valid
        if(body.newPassword !== body.confirmPassword) {
            // nonmatching passwords
            res.status(400).redirect("back");
        } else if(!/[A-Z].*[A-Z]/.test(body.newPassword) || !/[0-9].*[0-9]/.test(body.newPassword) || body.newPassword.length < 8) {
            // weak password (must have at least 2 uppercase letters and 2 digits with a total password length of 8 or more characters)
            res.status(400).redirect("back");
        } else {
            const salt = await genSalt(Math.floor(Math.random() * 10));
            const hash = await genHash(body.newPassword, salt);

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
        updateToken(req, res).then(() => res.status(204).send("Token updated"));
    } else {
        res.clearCookie("token");
        res.status(204).send("Token updated");
    }
});

api.post('/article/delete/:id', (req, res) => {
  const params = req.params;
  let id = params.id;
  articles.collection("posts").deleteOne({ "_id" : ObjectId(id) })
  res.redirect('/pages/self-care');
})

api.post("/delete-account", (req, res) => {
    const body = req.body;

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
    const body = req.body;

    if(body.email && body.content && body.name) {
        if(!body.email.match(/[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            // invalid email
            res.status(400).redirect("back");
        } else {
            const mailOptions = {
                from: process.env.GMAIL_NAME + "@gmail.com",
                to: "stranothus@gmail.com",
                subject: "Contact Email",
                text: ``,
                html: email.contact(body.name, body.email, body.content.replace(/</g, "&lt;").replace(/>/, "&gt;"))
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
    const body = req.body;

    if(req.loggedIn && body.title && body.completeBy && body.desc && body.urgency) {
        const goalObj = {
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
    const body = req.body;

    if(req.loggedIn && body.created && body.progress) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash, "goals.created" : new Date(body.created) }, { "$push" : { "goals.$.progress" :  body.progress }}, (err, result) => {
            if(err) console.error(err);

						updateToken(req, res).then(() => res.status(200).redirect("back"));
        });
    } else {
        res.status(400).redirect("back");
    }
});


api.post("/goal-finish", (req, res) => {
    const body = req.body;

    if(req.loggedIn && body.created) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash, "goals.created" : new Date(body.created) }, { "$set" : {"goals.$.completed" : true }}, (err, result) => {
            if(err) console.error(err);

						updateToken(req, res).then(() => res.status(200).redirect("/pages/dashboard"));
        });
    } else {
        res.status(400).redirect("back");
    }
});

api.post("/goal-delete", (req, res) => {
    const body = req.body;

    if(req.loggedIn && body.created) {
        users.collection("accounts").updateOne({ "hash" : req.loggedIn.hash }, { "$pull" : { "goals" : { "created" : new Date(body.created) }}}, function(err, result) {
            if(err) console.error(err);

						updateToken(req, res).then(() => res.status(200).redirect("/pages/dashboard"));
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
    const params = req.params;
    const condition = params.condition;

    health.collection("food").find({ "issue": { "$regex": new RegExp(condition, "i") }}).toArray(function(err, results) {
        if(err) console.error(err);

        res.json(results);
    });
});


// set up port

app.listen(3030, () => {
    console.log("Listening on port 3030");
});