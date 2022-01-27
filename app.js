const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const errorController = require('./controllers/error');

const User = require('./models/user');

require('./passport-setup');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

const HomeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie:{
      maxAge: 1000*60*60*24*30
    }
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.session.ispaid = user.ispaid;
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req ,res, next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isSubscribed = req.session.ispaid;
  next();
})

app.get('/auth/google',passport.authenticate('google',  {scope: ['email', 'profile']}));

app.get('/google/callback', (req, res, next)=>{
  passport.authenticate('google', (err, user, info) => {
    if(err){return next(err);}
    
    if(!user){
      return res.redirect('/auth/failure');
    }
    
    req.logIn(user, info, (err)=>{ 
      
      if(err){
        return next(err);
      }      
      
      req.session.isLoggedIn = true;
      req.session.user = info;

      return res.redirect('/');
    })
  })(req, res, next)
})

app.get('/auth/failure', (req, res)=>{
  res.json({
    msg: "Something went wrong!!",
  })
})

app.use(authRoutes);
app.use(HomeRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    app.listen(4000);
  })
  .catch(err => {
    console.log(err);
});
