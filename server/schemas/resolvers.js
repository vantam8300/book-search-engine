const { User,  } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('savedBooks');
        },
        user: async (parent, { email }) => {
            return User.findOne({ email }).populate('savedBooks');
        },
        book: async (parent, {bookId}) => {
            return Book.findOne({bookId});
        },
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, {authors, description, title, bookId, image}, context) => {
            if (context.user) {

                const user = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: {authors, description, title, bookId, image}}},
                    {new: true}
                );

                return user;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        deleteBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId}}},
                    {new: true}
                );

                return user;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }   
}

module.exports = resolvers;