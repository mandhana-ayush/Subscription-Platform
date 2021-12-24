const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/user');

const GOOGLE_CLIENT_ID = "359234699194-jbir71tuhrjoqjei3qo7kh1qn759b5eh.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/google/callback",
  passReqToCallback   : true
},

function(request, accessToken, refreshToken, profile, done) {
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
  
  User.findOne({email: profile.email})
    .then((user_)=>{
      if(user_){
        return done(null, profile, user_);
      }
      else{
        const user = new User({
         email: profile.email,
         password: profile.id,
         cart :{item: []} 
        })

        user.save()
         .then((newUser)=>{
           return done(null, profile, newUser);
         })
      }
    })
}
));


passport.serializeUser(function(user, done){
  done(null, user);
})

passport.deserializeUser(function(user, done){
  done(null, user);
})