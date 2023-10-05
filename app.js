require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
//for parsing request body

// EJS allows you to embed JavaScript code within your HTML templates, making it easier to generate dynamic content, iterate over data, and conditionally render HTML elements.
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();


app.set('view engine', 'ejs');

// using bodyparser as a middleware
app.use(bodyParser.urlencoded({ extended: true}));
// this is a middleware to serve static files from a directory called public
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/secretDB",{useNewUrlParser: true})
//Using { useNewUrlParser: true } is generally recommended, especially when working with recent versions of MongoDB and Mongoose, as it ensures that the new URL parser is used for parsing connection strings.

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// using encrypt plugin to encrypt the password before saving them to the database
// const secret = "Thisisourlittlesecret"; // this is a secret key which is used for encrypting and dcrypting the password


// userSchema.plugin(encrypt,{secret: secret, encryptedFields: ["password"]});


userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields: ["password"]});

//Models in Mongoose are used to interact with MongoDB collections. They define the structure of documents within a collection and provide methods for querying, creating, updating, and deleting documents in that collection.


// here i am creating a mongoose model name User based on userSchema this model can interact with the users collection in your database
const User = new mongoose.model("User", userSchema)


// if we want to make the name of the collection by ourselves then use below code
// const User = new mongoose.model("User", userSchema, "user");


app.get("/",function(req,res) {
    res.render("home")
})
app.get("/login",function(req,res) {
    res.render("login")
})
app.get("/register",function(req,res) {
    res.render("register")
})


// if user lands on register page then below route will be executed
app.post("/register",function(req,res) {
    //creating new instance of User model 
const newUser = new User({
    // getting email and password from the user
    email: req.body.username,
    password: req.body.password
})
//.save() is a method to save or update the document
newUser.save()
//if properly saved then thow user to secrets page
  .then(result => {
    res.render("secrets");
    console.log(result)
  })
  .catch(err => {
    console.log(err);
  });
})


// when user hits this route
app.post ("/login", function(req, res) {
    const username = req.body.username;    
    const password = req.body.password;    

// finding email
    User.findOne({ email: username })
    .then(foundUser => {
        // checking password
      if(foundUser){
          if(foundUser.password == password){
            // to get decrypted password
            console.log(password)
              res.render("secrets")
          }else {
            // Wrong password
            res.render("login", { error: "Incorrect password" });
          }
      }
      else {
        // User not found
        res.render("login", { error: "User not found" });
      }
    })
    .catch(err => {
      console.log(err)
    });
})

app.listen(8080,function() {
    console.log('listening on port 8080');
})

