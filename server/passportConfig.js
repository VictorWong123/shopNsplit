const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const userStorage = require('./userStorage');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                if (process.env.NODE_ENV === 'production') {
                    // Use MongoDB in production
                    const user = await User.findOne({ username });
                    if (!user) return done(null, false, { message: 'Invalid username or password.' });
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return done(null, false, { message: 'Invalid username or password.' });
                    return done(null, user);
                } else {
                    // Use in-memory users for development
                    const user = userStorage.getUser(username);
                    if (!user) return done(null, false, { message: 'Invalid username or password.' });
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return done(null, false, { message: 'Invalid username or password.' });
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id || user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            if (process.env.NODE_ENV === 'production') {
                // Find user in MongoDB
                const user = await User.findById(id);
                done(null, user);
            } else {
                // Find user in memory
                const user = userStorage.findUserById(id);
                done(null, user);
            }
        } catch (err) {
            done(err, null);
        }
    });
}; 