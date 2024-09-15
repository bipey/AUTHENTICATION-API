// config/passportConfig.js

import passport from "passport";
import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Configure Passport Google Strategy
const configurePassport = () => {
    console.log(process.env.AUTH_REDIRECT_URL)
  passport.use(new GoogleStrategy({
      clientID: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      callbackURL: process.env.AUTH_REDIRECT_URL
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      return done(null, profile); // Call done with the user profile
    }
  ));

  // Serializing user to session
  passport.serializeUser((user, done) => {
    done(null, user); // Store the user information in the session
  });

  // Deserializing user from session
  passport.deserializeUser((user, done) => {
    done(null, user); // Retrieve the user information from the session
  });
};

export default configurePassport;
