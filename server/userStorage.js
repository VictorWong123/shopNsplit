// Shared in-memory user storage for development
const inMemoryUsers = new Map();

module.exports = {
    addUser: (username, user) => {
        inMemoryUsers.set(username, user);
    },
    getUser: (username) => {
        return inMemoryUsers.get(username);
    },
    getAllUsers: () => {
        return Array.from(inMemoryUsers.values());
    },
    findUserById: (id) => {
        for (const [username, user] of inMemoryUsers.entries()) {
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }
}; 