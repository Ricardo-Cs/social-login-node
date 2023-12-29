const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_SECRET_KEY,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const user = await User.findOne({
                    accountId: profile.id,
                    provider: 'github',
                });

                if (!user) {
                    const newUser = new User({
                        accountId: profile.id,
                        name: profile.username,
                        provider: profile.provider,
                        avatarUrl: profile.photos[0].value,
                    });
                    await newUser.save();
                    return cb(null, profile);
                } else {
                    return cb(null, profile);
                }
            } catch (err) {
                return cb(err, null);
            }
        }
    )
);

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/callback',
    passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
    (req, res) => {
        // Autenticação bem-sucedida, redireciona para tela de sucesso.
        res.redirect('/auth/github/success');
    }
);

router.get('/success', (req, res) => {
    const userInfo = {
        id: req.session.passport.user.id,
        displayName: req.session.passport.user.username,
        provider: req.session.passport.user.provider,
        avatarUrl: req.session.passport.user.photos[0].value,
    };
    res.render('github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Github..'));

router.get('/signout', (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                console.log('Error destroying session:', err);
            } else {
                console.log('Session destroyed.');
            }
        });
        res.render('auth');
    } catch (err) {
        console.error('Failed to sign out GitHub user:', err);
        res.status(400).send({ message: 'Failed to sign out GitHub user' });
    }
});

module.exports = router;
