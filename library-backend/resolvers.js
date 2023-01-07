const { PubSub } = require("graphql-subscriptions")
const pubsub = new PubSub()
const Book = require("./models/book")
const Author = require("./models/author")
const User = require("./models/user")
const jwt = require("jsonwebtoken")
const { UserInputError, AuthenticationError } = require("apollo-server")
require("dotenv").config()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => await Author.find({}),
    allBooks: async (root, args) => {
      if (args.genre && args.author) {
        const author = await Author.find({ name: args.author })

        return await Book.find({
          genres: { $in: [args.genre] },
          author: author[0]._id,
        }).populate("author")
      }

      if (args.author) {
        const author = await Author.find({ name: args.author })
        return await Book.find({ author: author[0]._id }).populate("author")
      }

      if (args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } }).populate(
          "author"
        )
      }

      return await Book.find({}).populate("author")
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    genres: async (root) => {
      const books = await Book.find({})
      const genres = []
      books.forEach((book) => {
        book.genres.forEach((g) => {
          if (!genres.includes(g)) {
            genres.push(g)
          }
        })
      })

      return genres
    },
  },

  Author: {
    bookCount: (root) => root.books.length,
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if (await Book.findOne({ title: args.title })) {
        throw new UserInputError("Book title must be unique", {
          invalidArgs: args.title,
        })
      }

      if (!(await Author.findOne({ name: args.author }))) {
        const newAuthor = new Author({ name: args.author, books: [] })

        await newAuthor.save().catch((error) => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
      }
      const author = await Author.find({ name: args.author })
      const book = new Book({ ...args, author: author[0]._id })

      try {
        const savedBook = await book.save()
        console.log(author[0].books, "books")
        author[0].books = author[0].books.concat(savedBook.title)
        await author[0].save()
        pubsub.publish("BOOK_ADDED", {
          bookAdded: savedBook.populate("author"),
        })
        return await savedBook.populate("author")
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo

      try {
        author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    createAuthor: async (root, args) => {
      const author = new Author({
        name: args.name,
        born: args.born || null,
        books: [],
      })

      return author.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "salasana") {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
}
module.exports = resolvers
