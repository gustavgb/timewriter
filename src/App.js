import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Console from './Console'

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

function App () {
  return (
    <>
      <GlobalStyle />
      <Root>
        <Console />
      </Root>
    </>
  )
}

export default App
