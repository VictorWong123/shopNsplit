const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { userOperations } = require('./supabase');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await userOperations.findUserByUsername(username);
                if (!user) {
                    return done(null, false, { message: 'Invalid username or password.' });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid username or password.' });
                }

                return done(null, user);
            } catch (err) {
                console.error('Passport authentication error:', err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userOperations.findUserById(id);
            if (!user) {
                return done(null, null);
            }
            done(null, user);
        } catch (err) {
            console.error('Deserialize user error:', err);
            done(err, null);
        }
    });
}; 