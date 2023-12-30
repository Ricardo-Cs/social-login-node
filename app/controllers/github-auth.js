const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const githubAuthDal = require('../dal/github-auth.dal');
const router = express.Router();
require('dotenv').config();

let userProfile;

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_SECRET_KEY,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    )
);

router.get(
    '/',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/callback',
    passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
    async (req, res) => {
        try {
            const { failure, success } = await githubAuthDal.registerWithGitHub(userProfile);
            if (failure) {
                console.log('GitHub user already exists in DB..');
            } else {
                console.log('Registering new GitHub user..');
            }
            res.redirect('/auth/github/success');
        } catch (err) {
            console.error('Error registering GitHub user:', err);
            res.redirect('/auth/github/error');
        }
    }
);

router.get('/success', (req, res) => {
    console.log(userProfile);
    res.render('github-success', { user: userProfile });
});

router.get('/error', (req, res) => res.send('Error logging in via GitHub..'));

router.get('/signout', (req, res) => {
    try {
        req.session.destroy(function (err) {
            console.log('Session destroyed.');
        });
        res.render('auth');
    } catch (err) {
        res.status(400).send({ message: 'Failed to sign out user' });
    }
});

module.exports = router;
