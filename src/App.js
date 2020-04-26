import React, { useReducer, useCallback, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Console from 'Console'
import { streamLogs } from 'api/log'
import { login } from 'api/auth'
import { auth } from 'api'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 100%;
  }

  html {
    font-size: 62.5%;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`

const Root = styled.main`
  width: 100vw;
  height: 100vh;
  background-color: #8ab897;
  display: flex;
  align-items: center;
  justify-content: center;
`

const defaultState = {
  history: [],
  logs: [],
  userInput: [],
  requestInput: false,
  userId: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_HISTORY':
      return {
        ...state,
        history: state.history.concat(action.lines)
      }
    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: []
      }
    case 'SET_INPUT':
      return {
        ...state,
        userInput: action.nextInput
      }
    case 'SET_LOGS':
      return {
        ...state,
        logs: action.logs || []
      }
    case 'SET_USER':
      return {
        ...state,
        userId: action.userId
      }
    default:
      return state
  }
}

function App () {
  const [{ history, userInput, requestInput }, dispatch] = useReducer(reducer, defaultState)

  const handleCommand = useCallback(commandInput => {
    dispatch({
      type: 'ADD_HISTORY',
      lines: [commandInput]
    })

    const nextInput = userInput.concat([commandInput])
    if (requestInput) {
      dispatch({
        type: 'SET_INPUT',
        nextInput
      })
    }

    const args = commandInput.split('').reduce((acc, char, index, arr) => {
      if (((char === ' ' || char === '=') && !acc.safe)) {
        acc.list.push(commandInput.substring(acc.start, index))
        acc.start = index + 1
      } else if (index + 1 === arr.length) {
        acc.list.push(commandInput.substring(acc.start, index + 1))
      } else if (char === '"') {
        acc.safe = !acc.safe
      }

      return acc
    }, { start: 0, safe: false, list: [] }).list

    const command = args[0]
    const options = args.slice(1)

    const flags = options.reduce((acc, option, index, arr) => {
      if (option.match(/^--?/)) {
        acc[option] = arr[index + 1]
      }
      return acc
    }, {})

    console.log(args, flags)

    const promise = new Promise((resolve, reject) => {
      switch (command) {
        case 'login':
          login()
            .catch(err => {
              resolve(err.message)
            })
          break
        case 'clear':
          dispatch({
            type: 'CLEAR_HISTORY'
          })
          break
        default:
          resolve(`Command ${command} is not valid`)
      }
    })

    promise.then(message => {
      if (message) {
        dispatch({
          type: 'ADD_HISTORY',
          lines: [message]
        })
      }
    })
  }, [requestInput, userInput])

  useEffect(() => {
    streamLogs('test')
      .subscribe(logs => dispatch({
        type: 'SET_LOGS',
        logs
      }))

    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch({
          type: 'SET_USER',
          userId: user.uid
        })
        dispatch({
          type: 'ADD_HISTORY',
          lines: [`Logged in as ${user.displayName}`]
        })
      } else {
        dispatch({
          type: 'SET_USER',
          userId: null
        })
      }
    })
  }, [])

  return (
    <>
      <GlobalStyle />
      <Root>
        <Console history={history} onCommand={handleCommand} />
      </Root>
    </>
  )
}

export default App
