//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

// const encrypt = require("mongoose-encryption");

// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});
//should be before defining an model

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());  //create cookie and stuffs message of users identification
passport.deserializeUser(User.deserializeUser()); //crumble cookie and see message

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/secrets", function(req,res) {
    // res.render("secrets");
    if(req.isAuthenticated){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res) {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        res.redirect("/");
    })
})

app.route("/login")
.get( function(req, res) {
    res.render("login");
})
.post(function(req, res) {
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({ email: username })
    //     .then(foundUser => {
    //         if (foundUser) {

    //             // bcrypt.compare(password, foundUser.password /* hash*/ ).then(function(result) {
    //                 if (result) {
    //                     res.render("secrets");
    //                 } else {
    //                     res.send("Wrong password");
    //                 }
    //             // })
    //             // if (foundUser.password === hash) {
    //             //     res.render("secrets");
    //             // } 
    //             // else {
    //             //     res.send({ error: "Invalid password" });
    //             // }
    //         }
    //         else {
    //             res.send({ error: "User not found" });
    //         }
    //     })
    //     .catch(error => {
    //         if (error) {
    //             console.log(error);
    //         }
    //     })

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })

});

app.route("/register")
.get(function(req, res) {
    res.render("register");
})
.post(function(req,res) {

    // // bcrypt.hash(req.body.password , saltRounds).then(function(hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: req.body.password
    //         // password: hash
    //     })
    //     newUser.save()
    //     .then( () => {
    //         // Handle successful save
    //         res.render("secrets");
    //     })
    //     .catch(error => {
    //         // Handle error during save
    //         console.error(error);
    //     });
    // // })
    
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })

});

app.listen(3000, function() {
    console.log("Successfully started the server!!");
})
