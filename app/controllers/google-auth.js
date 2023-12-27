const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const express = require('express');
const googleAuth = require('../dal/google-auth.dal');
const router = express.Router();
require('dotenv').config();

let userProfile;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// Requisição em /auth/google, quando o usuário clica em "Entrar com google", transfere
// a requisição para o servidor do Google, para mostrar a tela de e-mails
router.get(
    '/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  // A URL deve ser a mesma que a 'Authorized redirect URIs' no cliente OAuth, ou seja: /auth/google/callback
  router.get(
    '/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
    (req, res) => {
      res.redirect('/auth/google/success'); // Autenticação bem-sucedida, redireciona para o success.
    }
  );
  
  router.get('/success', async (req, res) => {
    const { failure, success } = await googleAuth.registerWithGoogle(userProfile);
    if (failure) console.log('Google user already exist in DB..');
    else console.log('Registering new Google user..');
    res.render('success', { user: userProfile });
  });
  
  router.get('/error', (req, res) => res.send('Error logging in via Google..'));
  
  router.get('/signout', (req, res) => {
    try {
      req.session.destroy(function (err) {
        console.log('session destroyed.');
      });
      res.render('auth');
    } catch (err) {
      res.status(400).send({ message: 'Failed to sign out user' });
    }
  });
  
  module.exports = router;