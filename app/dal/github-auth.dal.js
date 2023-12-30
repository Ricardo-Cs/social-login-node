const User = require('./models/user.model');

const githubAuthDal = {
    registerWithGitHub: async (oauthUser) => {
        try {
            const isUserExists = await User.findOne({
                accountId: oauthUser.id,
                provider: oauthUser.provider,
            });

            if (isUserExists) {
                const failure = {
                    message: 'User already registered.',
                };
                return { failure };
            }

            const user = new User({
                accountId: oauthUser.id,
                name: oauthUser.username,
                provider: oauthUser.provider,
                email: oauthUser.emails && oauthUser.emails.length > 0 ? oauthUser.emails[0].value : null,
                photoURL: oauthUser.photos && oauthUser.photos.length > 0 ? oauthUser.photos[0].value : null,
            });

            await user.save();

            const success = {
                message: 'User registered.',
            };

            return { success };
        } catch (error) {
            console.error('Error registering user with GitHub:', error);
            const failure = {
                message: 'Error registering user with GitHub.',
            };
            return { failure };
        }
    },
};

module.exports = githubAuthDal;
