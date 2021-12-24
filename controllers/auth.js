const User = require('../models/user');
const bcrypt = require('bcrypt');


exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};


exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email})
    .then(user => {
      if(!user){
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.password)
      .then((bool)=>{
        if(bool){
          req.session.isLoggedIn = true;
          req.session.user = user;
        return res.redirect('/');
        }
      res.redirect('/login');
      })
      .catch((err)=>{
        console.log(err);
      })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password;
  const cnfpassword = req.body.confirmPassword
  
  User.findOne({email: email})
  .then((userDoc)=>{
    if(userDoc){
      return res.redirect('/signup');
    }

    bcrypt.hash(password, 12)
    .then((pass)=>{
        const user = new User({
          email: email,
          password: pass,
          cart: {item: []}
        })
        return user.save();
      })
    .catch((err)=>{
      console.log(err);
    })})
  .then((result)=>{
      return res.redirect('/login');
    })
  .catch(err=>{
    console.log(err);
  })};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
