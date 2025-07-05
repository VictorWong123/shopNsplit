const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const userStorage = require('./userStorage');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                // Check in-memory users first
                const user = userStorage.getUser(username);
                if (!user) return done(null, false, { message: 'Invalid username or password.' });
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return done(null, false, { message: 'Invalid username or password.' });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            // Find user in memory
            const user = userStorage.findUserById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}; 