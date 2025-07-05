const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const userStorage = require('./userStorage');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
                    // Use MongoDB in production
                    const user = await User.findOne({ username });
                    if (!user) return done(null, false, { message: 'Invalid username or password.' });
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return done(null, false, { message: 'Invalid username or password.' });
                    return done(null, user);
                } else {
                    // Use in-memory users for development or production fallback
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
        // Handle both MongoDB (_id) and in-memory (id) user objects
        const userId = user._id || user.id;
        done(null, userId);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
                // Find user in MongoDB
                const user = await User.findById(id);
                if (!user) {
                    console.log('User not found in MongoDB during deserialization:', id);
                    return done(null, null);
                }
                done(null, user);
            } else {
                // Find user in memory
                const user = userStorage.findUserById(id);
                if (!user) {
                    console.log('User not found in memory during deserialization:', id);
                    return done(null, null);
                }
                done(null, user);
            }
        } catch (err) {
            console.error('Deserialize user error:', err);
            done(err, null);
        }
    });
}; 