import { useState } from "react"
import { useMutation } from "@apollo/client"
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS } from "../queries"

const NewBook = ({ show, setPage }) => {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [published, setPublished] = useState("")
  const [genre, setGenre] = useState("")
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }, "Books"],
    onError: (error) => {
      console.log(error.graphQLErrors[0])
    },
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({ variables: { title, published, author, genres } })

    setTitle("")
    setPublished("")
    setAuthor("")
    setGenres([])
    setGenre("")
    setPage("books")
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre("")
  }

  const inputStyle = {
    marginLeft: 8,
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 25 }}>Add new book to the library:</h2>
      <form onSubmit={submit}>
        <div>
          title:
          <input
            style={inputStyle}
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author:
          <input
            style={inputStyle}
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published:
          <input
            style={inputStyle}
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button style={{ marginTop: 25 }} onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button style={{ marginTop: 30 }} type="submit">
          create book
        </button>
      </form>
    </div>
  )
}

export default NewBook
