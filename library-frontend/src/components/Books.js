import { ALL_BOOKS, GENRES } from "../queries"
import { useQuery } from "@apollo/client"
import { useState } from "react"
import { Table } from "react-bootstrap"

const Books = (props) => {
  const [genre, setGenre] = useState("")
  const result = useQuery(ALL_BOOKS, { variables: { genre } })
  const genresResult = useQuery(GENRES)

  if (!props.show) {
    return null
  }

  if (result.loading || genresResult.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  const genres = genresResult.data.genres

  return (
    <div className="page">
      <h2>Books</h2>
      <p>in genre: {genre}</p>

      <Table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <button onClick={() => setGenre("")}>all</button>
      {genres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
    </div>
  )
}

export default Books
