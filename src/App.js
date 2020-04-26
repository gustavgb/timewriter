import React, { useReducer, useCallback, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Console from 'Console'
import { newLog, startTimer, stopTimer, getLogs } from 'api/log'
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
    case 'SET_USER':
      return {
        ...state,
        userId: action.userId
      }
    default:
      return state
  }
}

const formatTime = (ts) => {
  const date = new Date(ts)
  return `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
}

const formatDuration = (ts) => {
  let seconds = Math.round(ts / 1000)
  let hours = 0
  let minutes = 0
  if (seconds > 3600) {
    hours = Math.floor(seconds / 3600)
    seconds -= hours
  }
  if (seconds > 60) {
    minutes = Math.floor(seconds / 60)
    seconds -= minutes
  }

  return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

function App () {
  const [state, dispatch] = useReducer(reducer, defaultState)
  const {
    history,
    userInput,
    requestInput,
    userId
  } = state

  const handleCommand = useCallback(commandInput => {
    dispatch({
      type: 'ADD_HISTORY',
      lines: [`> ${commandInput}`]
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
              reject(err)
            })
          break
        case 'clear':
          dispatch({
            type: 'CLEAR_HISTORY'
          })
          resolve()
          break
        case 'logs': {
          getLogs(userId)
            .then(logs => {
              const message = logs.map((log) =>
                `${log.id}) ${formatTime(log.start)} - ${formatTime(log.end)} (${formatDuration(log.duration)})${log.notes ? `: ${log.notes}` : log.notes}`
              ).join('\n')

              resolve(`Previous logs:\n${message}`)
            })
          break
        }
        case 'new':
          newLog(userId, {
            start: flags['--start'] || null,
            notes: flags['--notes'] || null,
            end: flags['--end'] || null
          })
            .then(() => resolve('Added log'))
            .catch(err => {
              reject(err)
            })
          break
        case 'start':
          startTimer(userId)
            .then(() => resolve('Started timer'))
            .catch(err => {
              reject(err)
            })
          break
        case 'stop':
          stopTimer(userId, flags['--notes'] || null)
            .then(() => resolve('Stopped timer'))
            .catch(err => {
              reject(err)
            })
          break
        default:
          resolve(`Command ${command} is not valid`)
      }
    })

    promise
      .then(message => {
        if (message) {
          dispatch({
            type: 'ADD_HISTORY',
            lines: message
              .toString()
              .split('\n')
              .map(line =>
                line
                  .replace(/\s/g, '&nbsp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
              )
          })
        }
      })
      .catch(err => {
        dispatch({
          type: 'ADD_HISTORY',
          lines: `Error: ${err.message}`
        })
      })
  }, [requestInput, userInput, userId])

  useEffect(() => {
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
