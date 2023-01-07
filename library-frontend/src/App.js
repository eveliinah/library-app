import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import Recommended from "./components/Recommended"
import { useApolloClient, useSubscription } from "@apollo/client"
import { BOOK_ADDED, ALL_BOOKS } from "./queries"
import "./App.css"

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(localStorage.getItem("library-user-token"))
  const client = useApolloClient()

  const loginText = !token ? "Login" : "Logout"

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const book = data.data.bookAdded
      window.alert(`New book ${book.title} added`)
      updateCache(
        client.cache,
        { query: ALL_BOOKS, variables: { genre: "" } },
        book
      )
    },
  })

  const loginClick = () => {
    if (!token) {
      setPage("login")
    } else {
      setToken(null)
      localStorage.clear()
      client.resetStore()
      setPage("login")
    }
  }

  return (
    <div className="container">
      <div>
        <button className="navButton" onClick={() => setPage("authors")}>
          Authors
        </button>
        <button className="navButton" onClick={() => setPage("books")}>
          Books
        </button>
        {token && (
          <button className="navButton" onClick={() => setPage("add")}>
            Add book
          </button>
        )}
        {token && (
          <button className="navButton" onClick={() => setPage("recommended")}>
            Recommended
          </button>
        )}
        <button className="logButton" onClick={loginClick}>
          {loginText}
        </button>
      </div>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} token={token} />

      <NewBook show={page === "add"} token={token} setPage={setPage} />

      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
      />

      <Recommended show={page === "recommended"} />
    </div>
  )
}

export default App
