// for using environment variables 

//An environment variable is a variable outside of your application's code that stores configuration settings, system information, or other data that your application needs to function correctly.

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

//for parsing request body

// for using hash functions
// const md5 = require('md5');

// now here we are using advanced method to secure password which is bcrypt
// const bcrypt = require('bcrypt'); 
// const saltRounds = 5;
// salt is a kind of random number which is added to the password to make it more secure
// saltRounds is the number of times we add the salt to the password to increase its strength


// EJS allows you to embed JavaScript code within your HTML templates, making it easier to generate dynamic content, iterate over data, and conditionally render HTML elements.
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
// const encrypt = require('mongoose-encryption');
const app = express();


app.set('view engine', 'ejs');

// using bodyparser as a middleware
app.use(bodyParser.urlencoded({ extended: true}));
// this is a middleware to serve static files from a directory called public
app.use(express.static("public"))

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/secretDB",{useNewUrlParser: true})
//Using { useNewUrlParser: true } is generally recommended, especially when working with recent versions of MongoDB and Mongoose, as it ensures that the new URL parser is used for parsing connection strings.

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// using encrypt plugin to encrypt the password before saving them to the database
// const secret = "Thisisourlittlesecret"; // this is a secret key which is used for encrypting and dcrypting the password


// userSchema.plugin(encrypt,{secret: secret, encryptedFields: ["password"]});

// here we are using environment variables so that when we push the code our key should not be accessible to the people
// userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields: ["password"]});

//Models in Mongoose are used to interact with MongoDB collections. They define the structure of documents within a collection and provide methods for querying, creating, updating, and deleting documents in that collection.


// here i am creating a mongoose model name User based on userSchema this model can interact with the users collection in your database
const User = new mongoose.model("User", userSchema)
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get('/secrets',function(req,res){
  if (req.isAuthenticated()) {
    res.render("secrets")
  }else{
    res.redirect('/login')
  }
})



// using hash functions
// if user lands on register page then below route will be executed


// app.post("/register",function(req,res) {
//     //creating new instance of User model 
// const newUser = new User({
//     // getting email and password from the user
//     email: req.body.username,
//     // converting password into hash string
//     password: md5(req.body.password)
// })
// //.save() is a method to save or update the document
// newUser.save()
// //if properly saved then thow user to secrets page
//   .then(result => {
//     res.render("secrets");
//     console.log(result)
//   })
//   .catch(err => {
//     console.log(err);
//   });
// })




// app.post("/register",function(req,res) {

//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//             //creating new instance of User model 
// const newUser = new User({
//     // getting email and password from the user
//     email: req.body.username,
//     password: hash
// })
// //.save() is a method to save or update the document
// newUser.save()
// //if properly saved then thow user to secrets page
//   .then(result => {
//     res.render("secrets");
//     console.log(result)
//   })
//   .catch(err => {
//     console.log(err);
//   });
// })
//     });


app.post("/register",function(req,res) {
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })
})




// checking password using md5
// when user hits this route


// app.post ("/login", function(req, res) {
//     const username = req.body.username;    
//     const password = md5(req.body.password);    

//     User.findOne({ email: username })
//     .then(foundUser => {
//         // checking password
//       if(foundUser){
//           if(foundUser.password == password){
//             // to get decrypted password
//             console.log(password)
//               res.render("secrets")
//           }else {
//             // Wrong password
//             res.render("login", { error: "Incorrect password" });
//           }
//       }
//       else {
//         // User not found
//         res.render("login", { error: "User not found" });
//       }
//     })
//     .catch(err => {
//       console.log(err)
//     });
// })


// checking password using bscript
// when user hits this route
// app.post ("/login", function(req, res) {
//     const username = req.body.username;    
//     const password = req.body.password;    

//     User.findOne({ email: username })
//     .then(foundUser => {
//       if(foundUser){
//         // checking password
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//            if(result === true){
//             res.render("secrets")
//            }
//         });
//       }
//       else {
//         // User not found
//         res.render("login", { error: "User not found" });
//       }
//     })
//     .catch(err => {
//       console.log(err)
//     });
// })


app.post("/login",function(req,res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })
})

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      // Handle error if logout encounters an issue
      console.error(err);
      res.redirect('/'); // Redirect to the home page or another appropriate route
    } else {
      // Successful logout
      res.redirect('/');
    }
  });
});


app.listen(8080,function() {
    console.log('listening on port 8080');
})

