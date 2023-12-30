const express = require('express');
const connectToMongoDb = require('./app/config/db.connect');
const app = express();
const session = require('express-session');
const authRouter = require('./app/controllers/google-auth');
const githubRouter = require('./app/controllers/github-auth');
const passport = require('passport');

// Configura a view engine que será usada para renderizar as páginas HTML.
app.set('view engine', 'ejs');
// Configura o servidor para receber arquivos estáticos da pasta assets.
app.use('/assets', express.static('assets'));

connectToMongoDb();

app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

app.get('/', (req, res) => {
    res.render('auth');
});

app.use('/auth/google', authRouter);
app.use('/auth/github', githubRouter);

app.listen(3000, () => console.log('App is running on port 3000...'));