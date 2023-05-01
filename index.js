const express = require('express');
const app = express();
const port = process.env.port || 3000;
const http = require('http').Server(app);
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {Schema} = mongoose;
//Set MongoDB connection
mongoose.connect('mongodb+srv://jenrah09:jenrah09@cluster0.o3tvy4v.mongodb.net/test_database' , {useNewUrlParser: true, useUnifiedTopology: true});
// Check connection if successful
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});


//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'k3y',
  resave: false,
  saveUninitialized: true
}));

//route
app.get('/', (req, res) =>{
    res.redirect('/register');
})
//Go to to register and display register.html
app.get('/register', (req, res, next) => {
  res.sendFile(path.join(__dirname,'src/register.html'));
})
//Go to to login and display login.html
app.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname,'src/login.html'));
})
app.get('/dashboard', (req,res) => {
  console.log("Session user:", req.session.user);
  if(req.session.user){
    res.sendFile(path.join(__dirname, 'src/dashboard.html'));
  }
  else{
    console.log("User not authenticated");
    res.redirect('/login');
  }
})
//Create database schema/VAR
const UserSchema = Schema({
  username: String,
  password: String,
})
//Create an instance of schema
const User = mongoose.model('users', UserSchema);

app.post('/register', (req, res) =>{
  const {username, password} = req.body;
  //Hash the password
  const hashPass = bcrypt.hashSync(password,10);
  req.password = hashPass;
  const user = new User({username, password: hashPass});
  //Save the user and pass to mongoDB
user.save()
  .then(() => {
    console.log('Data saved successfully');
    res.send('Registration successful!');
  })
  .catch((err) => {
    console.log(`Failed to save data: ${err}`);
    res.status(500).send('Registration failed. Please try again later.');
  });
})

app.post('/login', (req,res) => {
  const {username ,password} = req.body;

  // Find user in database
// Find user in database
User.findOne({username: username})
  .then(user => {
    if (!user) {
      res.send('User not found.');
    } else {
      bcrypt.compare(password, user.password)
        .then(result => {
          if (result === true) {
            console.log("Successful Login");
            req.session.user = user.username;
            res.redirect('/dashboard');
          } else {
            res.send('Incorrect password.');
          }
        })
        .catch(error => {
          console.error(error);
          res.send('An error occurred while logging in.');
        });
    }
  })
})

//Log out destroy session
//Get the to the route of logout
app.get('/logout', (req,res) =>{
  req.session.destroy();
  res.redirect('/login');
})




app .listen(port, () =>{
  console.log(`App listening on ${port}`);
})