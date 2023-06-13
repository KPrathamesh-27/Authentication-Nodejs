//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret = process.env.SECRET;

// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

//should be before defining an model

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
})

app.route("/login")
.get( function(req, res) {
    res.render("login");
})
.post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then(foundUser => {
            if (foundUser) {

                bcrypt.compare(password, foundUser.password /* hash*/ ).then(function(result) {
                    if (result) {
                        res.render("secrets");
                    } else {
                        res.send("Wrong password");
                    }
                })
                // if (foundUser.password === hash) {
                //     res.render("secrets");
                // } 
                // else {
                //     res.send({ error: "Invalid password" });
                // }
            }
            else {
                res.send({ error: "User not found" });
            }
        })
        .catch(error => {
            if (error) {
                console.log(error);
            }
        })


});

app.route("/register")
.get(function(req, res) {
    res.render("register");
})
.post(function(req,res) {

    bcrypt.hash(req.body.password , saltRounds).then(function(hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            // password: req.body.password
            password: hash
        })
        newUser.save()
        .then( () => {
            // Handle successful save
            res.render("secrets");
        })
        .catch(error => {
            // Handle error during save
            console.error(error);
        });
    })
    
});

app.listen(3000, function() {
    console.log("Successfully started the server!!");
})
