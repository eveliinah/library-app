import { ALL_AUTHORS, EDIT_BORN_YEAR } from "../queries"
import { useQuery, useMutation } from "@apollo/client"
import Select from "react-select"
import { useState } from "react"
import { Table } from "react-bootstrap"

const Authors = ({ show, token }) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setSelectedOption] = useState(null)
  const [setBornTo, setBornYear] = useState("")

  const [editAuthor] = useMutation(EDIT_BORN_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
  })

  const submit = async (event) => {
    event.preventDefault()
    editAuthor({ variables: { name, setBornTo } })
    setBornYear("")
  }

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  const options = authors.map((a) => ({ value: a.name, label: a.name }))

  return (
    <div className="page">
      <h2>Authors</h2>
      <Table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {token && (
        <>
          <h2 style={{ marginBottom: 20, marginTop: 30 }}>Set birthyear:</h2>
          <div style={{ width: 350, marginBottom: 30 }}>
            <Select
              defaultValue={name}
              onChange={(choice) => setSelectedOption(choice.label)}
              options={options}
              placeholder="Select author..."
            />
          </div>
          <form onSubmit={submit}>
            <div>
              Set born to:
              <input
                style={{ marginLeft: 10 }}
                value={setBornTo}
                onChange={({ target }) => setBornYear(Number(target.value))}
              />
              <button type="submit">Update author</button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default Authors
