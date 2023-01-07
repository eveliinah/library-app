import React, { useState, useEffect } from "react"
import { useMutation } from "@apollo/client"
import { LOGIN } from "../queries"
//import { useApolloClient } from "@apollo/client"

const LoginForm = ({ show, setError, setToken, setPage }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
      //setError(error.graphQLErrors[0].message)
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem("library-user-token", token)
    }
  }, [result.data]) // eslint-disable-line

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername("")
    setPassword("")
    setPage("authors")
  }

  const inputStyle = {
    marginLeft: 8,
  }

  return (
    <div className="page">
      <form onSubmit={submit}>
        <div>
          username:
          <input
            style={inputStyle}
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password:
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button style={{ marginTop: 20 }} type="submit">
          login
        </button>
      </form>
    </div>
  )
}

export default LoginForm
