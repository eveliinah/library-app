import { useQuery } from "@apollo/client"
import { ME, ALL_BOOKS } from "../queries"
import { Table } from "react-bootstrap"

const Recommended = ({ show }) => {
  const me = useQuery(ME, {
    pollInterval: 2000,
  })

  const result = useQuery(ALL_BOOKS, {
    skip: !me.data || me.data.me === null,
    variables: {
      genre: !me.data || me.data.me === null ? null : me.data.me.favoriteGenre,
    },
  })

  if (me.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  if (!result.data) {
    return null
  }

  const books = result.data ? result.data.allBooks : []

  return (
    <div className="page">
      <h2>Recommendations</h2>
      <p>
        Books in your favourite genre:{" "}
        <span style={{ fontWeight: "bold" }}></span>
      </p>
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
    </div>
  )
}

export default Recommended
